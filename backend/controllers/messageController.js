import Message from "../models/Message.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import cloudinary from "../config/cloudinary.js";

const extractCloudinaryAsset = (fileUrl = "") => {
  const match =
    fileUrl.match(
      /\/(image|raw|video)\/(upload|authenticated|private)\/(?:v\d+\/)?([^?#]+)/i
    ) ||
    fileUrl
      .replace("/image/authenticated/", "/image/upload/")
      .replace("/raw/authenticated/", "/raw/upload/")
      .match(
    /\/(image|raw|video)\/(upload|authenticated|private)\/(?:v\d+\/)?([^?#]+)/i
      );

  if (!match) return null;

  const resourceType = match[1].toLowerCase();
  const deliveryType = match[2].toLowerCase();
  const encodedPath = match[3];
  const decodedPath = decodeURIComponent(encodedPath);

  // Keep full decoded path for raw files to preserve extensions in public_id.
  if (resourceType === "raw") {
    return {
      resourceType,
      deliveryType,
      publicId: decodedPath,
    };
  }

  const lastDotIndex = decodedPath.lastIndexOf(".");
  const lastSlashIndex = decodedPath.lastIndexOf("/");
  const hasFormat = lastDotIndex > lastSlashIndex;

  return {
    resourceType,
    deliveryType,
    publicId: hasFormat ? decodedPath.slice(0, lastDotIndex) : decodedPath,
  };
};

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId, messageType, fileUrl, fileName } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    if (!content && !fileUrl) {
      return res
        .status(400)
        .json({ message: "Message content or file is required" });
    }

    let newMessage = await Message.create({
      sender: req.user._id,
      chat: chatId,
      content: content || "",
      messageType: messageType || "text",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      readBy: [req.user._id],
      reactions: [],
    });

    newMessage = await newMessage.populate("sender", "name email avatar");
    newMessage = await newMessage.populate("chat");

    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "name email avatar isOnline lastSeen",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name email avatar")
      .populate("chat")
      .populate("reactions.user", "name email avatar")
      .sort({ createdAt: 1 });

    return res.json(messages);
  } catch (error) {
    console.error("ALL MESSAGES ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const mimeType = req.file.mimetype || "";
    const isImage = mimeType.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";
    const publicId = req.file.filename || "";
    const cloudinaryUrl = publicId
      ? cloudinary.url(publicId, {
          resource_type: resourceType,
          type: "upload",
          secure: true,
        })
      : null;

    const deliveredFileUrl =
      cloudinaryUrl ||
      req.file.secure_url ||
      req.file.path ||
      "";

    return res.status(201).json({
      fileUrl: deliveredFileUrl,
      fileName: req.file.originalname,
      messageType: isImage ? "image" : "file",
    });
  } catch (error) {
    console.error("UPLOAD CHAT FILE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $push: { readBy: req.user._id },
      }
    );

    const updatedMessages = await Message.find({ chat: chatId })
      .populate("sender", "name email avatar")
      .populate("chat")
      .populate("reactions.user", "name email avatar")
      .sort({ createdAt: 1 });

    return res.json(updatedMessages);
  } catch (error) {
    console.error("MARK READ ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
      return res
        .status(400)
        .json({ message: "Message ID and emoji are required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user._id.toString()
    );

    if (existingReactionIndex !== -1) {
      message.reactions[existingReactionIndex].emoji = emoji;
    } else {
      message.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "name email avatar")
      .populate("chat")
      .populate("reactions.user", "name email avatar");

    return res.json(updatedMessage);
  } catch (error) {
    console.error("REACT TO MESSAGE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    const message = await Message.findById(messageId).populate("chat");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own message" });
    }

    const chatId = message.chat._id;

    await Message.findByIdAndDelete(messageId);

    const latestMessage = await Message.findOne({ chat: chatId })
      .sort({ createdAt: -1 })
      .populate("sender", "name email avatar")
      .populate("chat")
      .populate("reactions.user", "name email avatar");

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: latestMessage ? latestMessage._id : null,
    });

    return res.json({
      message: "Message deleted successfully",
      deletedMessageId: messageId,
      chatId,
      latestMessage: latestMessage || null,
    });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId, content } = req.body;

    if (!messageId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Message ID and updated content are required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can edit only your own message" });
    }

    if (message.messageType !== "text") {
      return res.status(400).json({ message: "Only text messages can be edited" });
    }

    message.content = content.trim();
    message.edited = true;

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "name email avatar")
      .populate("chat")
      .populate("reactions.user", "name email avatar");

    return res.json(updatedMessage);
  } catch (error) {
    console.error("EDIT MESSAGE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getFileAccessUrl = async (req, res) => {
  try {
    const { fileUrl, fileName, download = false } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: "File URL is required" });
    }

    const asset = extractCloudinaryAsset(fileUrl);
    if (!asset) {
      return res.status(400).json({ message: "Invalid Cloudinary file URL" });
    }

    const requiresSignedUrl =
      asset.deliveryType === "authenticated" || asset.deliveryType === "private";

    const signedUrl = cloudinary.url(asset.publicId, {
      resource_type: asset.resourceType,
      type: requiresSignedUrl ? asset.deliveryType : "upload",
      secure: true,
      sign_url: requiresSignedUrl,
      attachment: download ? fileName || true : false,
    });

    return res.json({ url: signedUrl });
  } catch (error) {
    console.error("GET FILE ACCESS URL ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
