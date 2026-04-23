import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    let isChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email avatar isOnline lastSeen",
    });

    if (isChat) {
      return res.json(isChat);
    }

    const createdChat = await Chat.create({
      chatName: "private chat",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(createdChat._id)
      .populate("users", "-password")
      .populate("latestMessage");

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email avatar isOnline lastSeen",
    });

    const unreadCountsRaw = await Chat.aggregate([
      {
        $match: {
          users: { $elemMatch: { $eq: req.user._id } },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "chat",
          as: "messages",
        },
      },
      {
        $project: {
          _id: 1,
          unreadCount: {
            $size: {
              $filter: {
                input: "$messages",
                as: "message",
                cond: {
                  $and: [
                    { $ne: ["$$message.sender", req.user._id] },
                    { $not: [{ $in: [req.user._id, "$$message.readBy"] }] },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    const unreadCountMap = unreadCountsRaw.reduce((acc, item) => {
      acc[item._id.toString()] = item.unreadCount || 0;
      return acc;
    }, {});

    const chatsWithUnreadCounts = chats.map((chat) => ({
      ...chat.toObject(),
      unreadCount: unreadCountMap[chat._id.toString()] || 0,
    }));

    res.json(chatsWithUnreadCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!name || !users) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    let parsedUsers = [];

    if (typeof users === "string") {
      parsedUsers = JSON.parse(users);
    } else {
      parsedUsers = users;
    }

    if (parsedUsers.length < 2) {
      return res
        .status(400)
        .json({ message: "Group chat needs at least 2 users" });
    }

    parsedUsers.push(req.user._id);

    const uniqueUsers = [...new Set(parsedUsers.map((id) => id.toString()))];

    const groupChat = await Chat.create({
      chatName: name,
      users: uniqueUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName?.trim()) {
      return res.status(400).json({ message: "Chat id and new name are required" });
    }

    const existingChat = await Chat.findById(chatId);

    if (!existingChat || !existingChat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (existingChat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only group admin can rename group" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName.trim() },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: "Chat id and user id are required" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only group admin can add members" });
    }

    const alreadyExists = chat.users.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "User already exists in group" });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: "Chat id and user id are required" });
    }

    const chat = await Chat.findById(chatId);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
    const isSelfRemove = userId.toString() === req.user._id.toString();

    if (!isAdmin && !isSelfRemove) {
      return res.status(403).json({
        message: "Only group admin can remove other members",
      });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
