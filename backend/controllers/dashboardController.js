import Chat from "../models/Chat.js";
import Event from "../models/Event.js";
import Message from "../models/Message.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const toDayKey = (date) => date.toISOString().split("T")[0];

export const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [totalUsers, totalChats, messagesToday, upcomingEvents, activeSessions] =
      await Promise.all([
        User.countDocuments(),
        Chat.countDocuments(),
        Message.countDocuments({
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
        Event.countDocuments({
          date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }),
        User.countDocuments({ isOnline: true }),
      ]);

    const messages = await Message.find(
      { createdAt: { $gte: sevenDaysAgo } },
      { createdAt: 1 },
    ).lean();

    const activeUsersPerDay = await User.aggregate([
      { $match: { updatedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const roleDistributionRaw = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + index);
      return date;
    });

    const messageMap = messages.reduce((acc, msg) => {
      const key = toDayKey(new Date(msg.createdAt));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const activeUserMap = activeUsersPerDay.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const trend = days.map((day) => {
      const key = toDayKey(day);
      return {
        name: day.toLocaleDateString("en-US", { weekday: "short" }),
        date: key,
        activeUsers: activeUserMap[key] || 0,
        messages: messageMap[key] || 0,
      };
    });

    const roleLookup = roleDistributionRaw.reduce((acc, item) => {
      acc[item._id || "user"] = item.count;
      return acc;
    }, {});

    const roleDistribution = [
      { name: "Users", value: roleLookup.user || 0 },
      { name: "Organizers", value: roleLookup.organizer || 0 },
      { name: "Admins", value: roleLookup.admin || 0 },
    ];

    return res.json({
      stats: {
        totalUsers,
        messagesToday,
        activeSessions,
        upcomingEvents,
        totalChats,
        totalProducts: await Product.countDocuments(),
      },
      trend,
      roleDistribution,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
