import crypto from "crypto";
import jwt from "jsonwebtoken";

const parseRefreshLifetimeMs = () => {
  const raw = process.env.REFRESH_TOKEN_EXPIRES_DAYS;
  const days = Number.parseInt(raw || "7", 10);
  const normalizedDays = Number.isNaN(days) || days < 1 ? 7 : days;
  return normalizedDays * 24 * 60 * 60 * 1000;
};

export const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });

export const createRefreshTokenValue = () => crypto.randomBytes(48).toString("hex");

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const getRefreshTokenCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  const usePartitionedCookie =
    isProd && process.env.COOKIE_PARTITIONED?.toLowerCase() !== "false";

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    ...(usePartitionedCookie ? { partitioned: true } : {}),
    maxAge: parseRefreshLifetimeMs(),
    path: "/api/auth",
  };
};
