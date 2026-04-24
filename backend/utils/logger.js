const formatMeta = (meta = {}) => {
  try {
    return JSON.stringify(meta);
  } catch {
    return "{}";
  }
};

const baseLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${level.toUpperCase()} ${message} ${formatMeta(meta)}`;

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(line);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(line);
};

export const logger = {
  info: (message, meta) => baseLog("info", message, meta),
  warn: (message, meta) => baseLog("warn", message, meta),
  error: (message, meta) => baseLog("error", message, meta),
};

