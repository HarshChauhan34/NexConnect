import { io } from "socket.io-client";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const envSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();
const allowCrossOriginSocket =
  import.meta.env.VITE_ALLOW_CROSS_ORIGIN_SOCKET === "true";
const isAbsoluteApiUrl = /^https?:\/\//i.test(envApiUrl || "");
const isAbsoluteSocketUrl = /^https?:\/\//i.test(envSocketUrl || "");
const isLocalhostRuntime =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const allowRemoteSocketInLocalDev =
  import.meta.env.VITE_ALLOW_REMOTE_SOCKET_IN_LOCAL_DEV === "true";
const apiBase = (envApiUrl || "").replace(/\/api\/?$/, "");

const SOCKET_URL = import.meta.env.PROD
  ? allowCrossOriginSocket && envSocketUrl
    ? envSocketUrl
    : !isAbsoluteSocketUrl && envSocketUrl
      ? envSocketUrl
      : !isAbsoluteApiUrl && apiBase
        ? apiBase
        : window.location.origin
  : isLocalhostRuntime &&
      !envSocketUrl &&
      isAbsoluteApiUrl &&
      !allowRemoteSocketInLocalDev
    ? "http://localhost:5000"
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
