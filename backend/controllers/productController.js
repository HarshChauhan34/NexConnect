import Product from "../models/Product.js";

const normalizePagination = (page, limit) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  return {
    page: Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
    limit: Number.isNaN(parsedLimit) || parsedLimit < 1 ? 6 : parsedLimit,
  };
};

export const getProducts = async (req, res) => {
  try {
    const { search = "", page, limit } = req.query;
    const pagination = normalizePagination(page, limit);

    const query = search.trim()
      ? {
          name: { $regex: search.trim(), $options: "i" },
        }
      : {};

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .lean();

    return res.json({
      items: products,
      page: pagination.page,
      limit: pagination.limit,
      total,
      hasMore: pagination.page * pagination.limit < total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, type, price, rating = 0, description = "" } = req.body;

    if (!name || !type || price === undefined || price === null) {
      return res
        .status(400)
        .json({ message: "Name, type and price are required" });
    }

    const product = await Product.create({
      name: name.trim(),
      type: type.trim(),
      price: Number(price),
      rating: Number(rating),
      description: description.trim(),
      createdBy: req.user._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = product.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You can only delete products you created" });
    }

    await product.deleteOne();
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
