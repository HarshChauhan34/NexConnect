export const cacheFor = (seconds) => (req, res, next) => {
  if (req.method !== "GET") return next();

  res.setHeader(
    "cache-control",
    `private, max-age=${seconds}, stale-while-revalidate=${Math.round(seconds / 2)}`,
  );

  return next();
};
