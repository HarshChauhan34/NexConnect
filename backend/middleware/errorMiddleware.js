export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isProd = process.env.NODE_ENV === "production";

  return res.status(statusCode).json({
    message: err.message || "Internal server error",
    requestId: req.requestId,
    ...(isProd ? {} : { stack: err.stack }),
  });
};
