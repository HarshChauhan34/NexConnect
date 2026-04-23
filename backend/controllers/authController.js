import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  createRefreshTokenValue,
  generateAccessToken,
  getRefreshTokenCookieOptions,
  hashToken,
} from "../utils/tokens.js";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

const allowedRoles = new Set(["admin", "user", "organizer"]);

const getRefreshTokenSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const refreshTtlDays = Number.parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7",
  10,
);

const getRefreshExpiryDate = () => {
  const days = Number.isNaN(refreshTtlDays) || refreshTtlDays < 1 ? 7 : refreshTtlDays;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const signRefreshToken = (id, tokenId) =>
  jwt.sign({ id, tokenId }, getRefreshTokenSecret(), {
    expiresIn: `${Number.isNaN(refreshTtlDays) || refreshTtlDays < 1 ? 7 : refreshTtlDays}d`,
  });

const serializeUser = (user, accessToken) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio || "",
  role: user.role || "user",
  organizerRequestStatus: user.organizerRequestStatus || "none",
  token: accessToken,
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    ...getRefreshTokenCookieOptions(),
    maxAge: undefined,
  });
};

const issueAuthSession = async (res, user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshTokenRaw = createRefreshTokenValue();
  const tokenId = crypto.randomBytes(16).toString("hex");
  const refreshToken = signRefreshToken(user._id, tokenId + refreshTokenRaw);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpire = getRefreshExpiryDate();
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);
  return serializeUser(user, accessToken);
};

const createUser = async ({ name, email, password, role }) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) {
    throw new Error("User already exists");
  }

  return User.create({
    name: cleanName,
    email: cleanEmail,
    password,
    role,
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-64 chars and include uppercase, lowercase, number, and symbol",
      });
    }

    const user = await createUser({
      name,
      email,
      password,
      role: "user",
    });

    const payload = await issueAuthSession(res, user);
    return res.status(201).json(payload);
  } catch (error) {
    const code = error.message === "User already exists" ? 400 : 500;
    return res.status(code).json({ message: error.message });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole =
      typeof role === "string" && allowedRoles.has(role.toLowerCase())
        ? role.toLowerCase()
        : "user";

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-64 chars and include uppercase, lowercase, number, and symbol",
      });
    }

    const user = await createUser({
      name,
      email,
      password,
      role: normalizedRole,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    const code = error.message === "User already exists" ? 400 : 500;
    return res.status(code).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.isOnline = true;
    user.lastSeen = null;

    const payload = await issueAuthSession(res, user);
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    let decoded = null;
    try {
      decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
    } catch {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id).select(
      "+refreshTokenHash +refreshTokenExpire",
    );

    if (!user || !user.refreshTokenHash || !user.refreshTokenExpire) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Session expired" });
    }

    if (user.refreshTokenExpire < new Date()) {
      user.refreshTokenHash = null;
      user.refreshTokenExpire = null;
      await user.save({ validateBeforeSave: false });
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Session expired" });
    }

    if (user.refreshTokenHash !== hashToken(refreshToken)) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    const payload = await issueAuthSession(res, user);
    return res.json(payload);
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await User.findOneAndUpdate(
        { refreshTokenHash: hashed },
        { refreshTokenHash: null, refreshTokenExpire: null },
      ).catch(() => {});
    }

    clearRefreshCookie(res);
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => res.json(req.user);

export const updateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof email === "string" && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = normalizedEmail;
    }

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (typeof bio === "string") {
      user.bio = bio.trim();
    }

    await user.save({ validateBeforeSave: false });
    const accessToken = generateAccessToken(user._id);
    return res.json(serializeUser(user, accessToken));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar image is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.avatar = req.file.path;
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id);
    return res.json({
      message: "Avatar updated",
      avatar: user.avatar,
      user: serializeUser(user, accessToken),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+resetPasswordToken +resetPasswordExpire",
    );

    if (!user) {
      return res.json({
        message: "If the email exists, password reset instructions were sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(resetToken);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 1000 * 60 * 15);
    await user.save({ validateBeforeSave: false });

    const response = {
      message: "If the email exists, password reset instructions were sent.",
      expiresAt: user.resetPasswordExpire,
    };

    if (process.env.NODE_ENV !== "production") {
      response.resetToken = resetToken;
    }

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-64 chars and include uppercase, lowercase, number, and symbol",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(token),
      resetPasswordExpire: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    const payload = await issueAuthSession(res, user);
    return res.json({
      message: "Password has been reset successfully",
      user: payload,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    }).select("-password");

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const requestOrganizerRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "organizer") {
      return res.status(400).json({ message: "You are already an organizer" });
    }

    if (user.organizerRequestStatus === "pending") {
      return res.status(400).json({ message: "Organizer request already pending" });
    }

    user.organizerRequestStatus = "pending";
    user.organizerRequestedAt = new Date();
    user.organizerReviewedAt = null;
    user.organizerReviewedBy = null;
    await user.save({ validateBeforeSave: false });

    return res.json({
      message: "Organizer request submitted to admin",
      organizerRequestStatus: user.organizerRequestStatus,
      organizerRequestedAt: user.organizerRequestedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrganizerRequests = async (req, res) => {
  try {
    const requests = await User.find({
      organizerRequestStatus: "pending",
    })
      .select("name email role organizerRequestStatus organizerRequestedAt")
      .sort({ organizerRequestedAt: 1 });

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const reviewOrganizerRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be approve or reject" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.organizerRequestStatus !== "pending") {
      return res.status(400).json({ message: "No pending organizer request" });
    }

    if (action === "approve") {
      user.role = "organizer";
      user.organizerRequestStatus = "approved";
    } else {
      user.organizerRequestStatus = "rejected";
    }

    user.organizerReviewedAt = new Date();
    user.organizerReviewedBy = req.user._id;
    await user.save({ validateBeforeSave: false });

    return res.json({
      message:
        action === "approve"
          ? "Organizer request approved"
          : "Organizer request rejected",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizerRequestStatus: user.organizerRequestStatus,
        organizerReviewedAt: user.organizerReviewedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
