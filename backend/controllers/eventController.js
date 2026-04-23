import Event from "../models/Event.js";

const normalizePagination = (page, limit) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  return {
    page: Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
    limit: Number.isNaN(parsedLimit) || parsedLimit < 1 ? 8 : parsedLimit,
  };
};

export const getEvents = async (req, res) => {
  try {
    const { search = "", category = "All", page, limit } = req.query;
    const pagination = normalizePagination(page, limit);

    const query = {};

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { city: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category !== "All") {
      query.category = category;
    }

    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean();

    return res.json({
      items: events,
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, category, city, date, description = "" } = req.body;

    if (!title || !category || !city || !date) {
      return res
        .status(400)
        .json({ message: "Title, category, city and date are required" });
    }

    const event = await Event.create({
      title: title.trim(),
      category: category.trim(),
      city: city.trim(),
      date: new Date(date),
      description: description.trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json(event);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = event.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You can only delete events you created" });
    }

    await event.deleteOne();
    return res.json({ message: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
