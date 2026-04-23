export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};
