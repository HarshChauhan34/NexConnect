import axios from "axios";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  USER_STORAGE_KEY,
} from "../constants/auth";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const isAbsoluteUrl = /^https?:\/\//i.test(envApiUrl || "");
const isLocalhostRuntime =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const allowRemoteApiInLocalDev =
  import.meta.env.VITE_ALLOW_REMOTE_API_IN_LOCAL_DEV === "true";

const API_BASE_URL = import.meta.env.PROD
  ? isAbsoluteUrl
    ? "/api"
    : envApiUrl || "/api"
  : isLocalhostRuntime && isAbsoluteUrl && !allowRemoteApiInLocalDev
    ? "http://localhost:5000/api"
    : envApiUrl || "http://localhost:5000/api";

const RETRIABLE_METHODS = new Set(["get", "head", "options"]);
const RETRIABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const RETRY_LIMIT = Number.parseInt(import.meta.env.VITE_API_RETRY_LIMIT || "2", 10);
const RETRY_BASE_DELAY_MS = Number.parseInt(import.meta.env.VITE_API_RETRY_DELAY_MS || "350", 10);
const clearStoredSession = () => {
  sessionStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
  }
};

const hasStoredSession = () =>
  Boolean(
    sessionStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem(USER_STORAGE_KEY),
  );

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: Number.parseInt(import.meta.env.VITE_API_TIMEOUT_MS || "10000", 10),
});

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

const shouldRetryRequest = (error, config) => {
  const method = (config?.method || "get").toLowerCase();
  if (!RETRIABLE_METHODS.has(method)) return false;

  const status = error.response?.status;
  if (status && RETRIABLE_STATUS_CODES.has(status)) return true;
  return Boolean(error.code === "ECONNABORTED" || error.message?.includes("Network Error"));
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const statusCode = error.response?.status;

    if (
      statusCode === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/register") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      if (!hasStoredSession()) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              if (token) {
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${token}`,
                };
              }
              resolve(API(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await API.post("/auth/refresh");
        const newUser = refreshResponse.data;
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        processQueue(null, newUser.token);
        return API(originalRequest);
      } catch (refreshError) {
        clearStoredSession();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (shouldRetryRequest(error, originalRequest)) {
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount < RETRY_LIMIT) {
        originalRequest._retryCount = retryCount + 1;
        const backoffDelay = RETRY_BASE_DELAY_MS * 2 ** retryCount;
        await wait(backoffDelay);
        return API(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default API;
