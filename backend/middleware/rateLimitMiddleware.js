const store = new Map();

const getClientKey = (req) => {
  const forwarded = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim();
  return `${forwarded || req.socket.remoteAddress || "unknown"}:${req.path}`;
};

const cleanup = () => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
};

setInterval(cleanup, 60_000).unref();

export const createRateLimiter = ({ maxRequests, windowMs, message }) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = getClientKey(req);
    const current = store.get(key);

    if (!current || current.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      store.set(key, fresh);
      res.setHeader("x-ratelimit-limit", String(maxRequests));
      res.setHeader("x-ratelimit-remaining", String(maxRequests - fresh.count));
      res.setHeader("x-ratelimit-reset", String(Math.ceil(fresh.resetAt / 1000)));
      return next();
    }

    current.count += 1;
    store.set(key, current);

    res.setHeader("x-ratelimit-limit", String(maxRequests));
    res.setHeader("x-ratelimit-remaining", String(Math.max(0, maxRequests - current.count)));
    res.setHeader("x-ratelimit-reset", String(Math.ceil(current.resetAt / 1000)));

    if (current.count > maxRequests) {
      return res.status(429).json({
        message: message || "Too many requests. Please try again shortly.",
      });
    }

    return next();
  };
};

