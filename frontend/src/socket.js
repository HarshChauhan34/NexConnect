import { io } from "socket.io-client";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const envSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
const apiBase = (envApiUrl || "").replace(/\/api\/?$/, "");

const SOCKET_URL = import.meta.env.PROD
  ? envSocketUrl || apiBase || window.location.origin
  : envSocketUrl || apiBase || "http://localhost:5000";

const shouldForcePolling =
  import.meta.env.PROD &&
  typeof window !== "undefined" &&
  SOCKET_URL === window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: shouldForcePolling ? ["polling"] : undefined,
  upgrade: !shouldForcePolling,
});
