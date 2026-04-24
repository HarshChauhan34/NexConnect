import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Server } from "socket.io";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { cacheFor } from "./middleware/cacheMiddleware.js";
import { createRateLimiter } from "./middleware/rateLimitMiddleware.js";
import { requestContext } from "./middleware/requestContextMiddleware.js";
import { sanitizeInput } from "./middleware/sanitizeInputMiddleware.js";
import { securityHeaders } from "./middleware/securityHeadersMiddleware.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const envAllowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];
const allowVercelPreviews =
  process.env.ALLOW_VERCEL_PREVIEWS?.toLowerCase() !== "false";

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) return true;

  if (
    allowVercelPreviews &&
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
  ) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header) like Postman/cURL.
    if (!origin) return callback(null, true);

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(
  cors(corsOptions),
);

app.use(requestContext);
app.use(securityHeaders);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeInput);

const globalLimiter = createRateLimiter({
  maxRequests: Number.parseInt(process.env.RATE_LIMIT_MAX || "400", 10),
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  message: "Too many requests from this client. Slow down and try again.",
});

const authLimiter = createRateLimiter({
  maxRequests: Number.parseInt(process.env.AUTH_RATE_LIMIT_MAX || "35", 10),
  windowMs: Number.parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "60000", 10),
  message: "Too many authentication attempts. Please retry in a minute.",
});

const messageLimiter = createRateLimiter({
  maxRequests: Number.parseInt(process.env.MESSAGE_RATE_LIMIT_MAX || "180", 10),
  windowMs: Number.parseInt(process.env.MESSAGE_RATE_LIMIT_WINDOW_MS || "60000", 10),
  message: "Message throughput exceeded. Please wait briefly.",
});

app.use(globalLimiter);

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RealTimeChatApp API",
      version: "1.0.0",
      description: "MERN real-time chat, events, products, and dashboard API",
    },
    servers: [{ url: process.env.SERVER_URL || "http://localhost:5000/api" }],
  },
  apis: ["./routes/*.js", "./docs/**/*.yaml"],
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageLimiter, messageRoutes);
app.use("/api/events", cacheFor(60), eventRoutes);
app.use("/api/products", cacheFor(60), productRoutes);
app.use("/api/dashboard", cacheFor(30), dashboardRoutes);

const io = new Server(server, {
  cors: { ...corsOptions, methods: ["GET", "POST"] },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  socket.on("setup", async (userData) => {
    const userId = userData?._id?.toString();
    if (!userId) return;

    socket.userId = userId;
    socket.join(userData._id);
    socket.emit("connected");

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: null,
    }).catch(() => {});
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.to(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing", room);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat?.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.to(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("messages seen", ({ chatId, userId }) => {
    socket.to(chatId).emit("messages seen", { chatId, userId });
  });

  socket.on("message reaction", (updatedMessage) => {
    const chat = updatedMessage.chat;
    if (!chat?.users) return;

    chat.users.forEach((user) => {
      socket.to(user._id).emit("message reaction", updatedMessage);
    });
  });

  socket.on("message deleted", (payload) => {
    if (payload?.chatId) {
      socket.to(payload.chatId).emit("message deleted", payload);
      return;
    }
    socket.broadcast.emit("message deleted", payload);
  });

  socket.on("message edited", (updatedMessage) => {
    const chatId = updatedMessage?.chat?._id;
    if (chatId) {
      socket.to(chatId).emit("message edited", updatedMessage);
      return;
    }
    socket.broadcast.emit("message edited", updatedMessage);
  });

  socket.on("user online", async (userId) => {
    const normalizedId = userId?.toString();
    if (!normalizedId) return;

    socket.userId = normalizedId;
    await User.findByIdAndUpdate(normalizedId, {
      isOnline: true,
      lastSeen: null,
    }).catch(() => {});

    socket.broadcast.emit("user online", normalizedId);
  });

  socket.on("user offline", async (userId) => {
    const normalizedId = userId?.toString();
    if (!normalizedId) return;

    await User.findByIdAndUpdate(normalizedId, {
      isOnline: false,
      lastSeen: new Date(),
    }).catch(() => {});

    socket.broadcast.emit("user offline", normalizedId);
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      }).catch(() => {});

      socket.broadcast.emit("user offline", socket.userId);
    }
  });
});

app.use(notFound);
app.use(errorHandler);

export { app, io, server };
