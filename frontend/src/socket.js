import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const fallbackSocketUrl = apiUrl.replace(/\/api\/?$/, "");
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || fallbackSocketUrl;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
