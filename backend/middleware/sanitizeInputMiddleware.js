const SAFE_TEXT_REGEX = /[^\x09\x0A\x0D\x20-\x7E]/g;

const stripDangerousMarkup = (value) =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(SAFE_TEXT_REGEX, "")
    .trim();

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return stripDangerousMarkup(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
      acc[key] = sanitizeValue(nestedValue);
      return acc;
    }, {});
  }

  return value;
};

const mutateObject = (target, sanitized) => {
  if (!target || typeof target !== "object") return;
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(target, sanitized);
};

export const sanitizeInput = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  mutateObject(req.query, sanitizeValue(req.query));
  mutateObject(req.params, sanitizeValue(req.params));
  next();
};
