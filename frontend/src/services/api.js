import axios from "axios";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const isAbsoluteUrl = /^https?:\/\//i.test(envApiUrl || "");
const isLocalhostRuntime =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
const allowRemoteApiInLocalDev =
  import.meta.env.VITE_ALLOW_REMOTE_API_IN_LOCAL_DEV === "true";

const API_BASE_URL = import.meta.env.PROD
  ? isAbsoluteUrl
    ? "/api"
    : envApiUrl || "/api"
  : isLocalhostRuntime && isAbsoluteUrl && !allowRemoteApiInLocalDev
    ? "http://localhost:5000/api"
    : envApiUrl || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    localStorage.removeItem("user");
  }

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/login") &&
      !originalRequest?.url?.includes("/auth/register") &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
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
        localStorage.setItem("user", JSON.stringify(newUser));
        processQueue(null, newUser.token);
        originalRequest.headers.Authorization = `Bearer ${newUser.token}`;
        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("user");
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
