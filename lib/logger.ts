type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMeta extends Record<string, unknown> {
  route?: string;
  userId?: string;
  statusCode?: number;
}

function log(level: LogLevel, message: string, meta?: LogMeta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  if (process.env.NODE_ENV === "production") {
    console[level](JSON.stringify(entry));
  } else {
    console[level](`[${level.toUpperCase()}] ${message}`, meta ?? "");
  }
}

export const logger = {
  debug: (msg: string, meta?: LogMeta) => log("debug", msg, meta),
  info:  (msg: string, meta?: LogMeta) => log("info",  msg, meta),
  warn:  (msg: string, meta?: LogMeta) => log("warn",  msg, meta),
  error: (msg: string, meta?: LogMeta) => log("error", msg, meta),
};
