const strictCspValue = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self'",
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const docsCspValue = strictCspValue.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'");

export const securityHeaders = (req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("x-xss-protection", "0");
  res.setHeader("referrer-policy", "strict-origin-when-cross-origin");
  res.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("cross-origin-opener-policy", "same-origin");
  res.setHeader("cross-origin-resource-policy", "same-site");
  const cspValue = req.path.startsWith("/api/docs") ? docsCspValue : strictCspValue;
  res.setHeader("content-security-policy", cspValue);

  if (isProd) {
    res.setHeader("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  }

  const isForwardedAsHttps = req.headers["x-forwarded-proto"] === "https";
  if (isProd && !req.secure && !isForwardedAsHttps) {
    return res.status(400).json({ message: "HTTPS is required" });
  }

  return next();
};
