import API from "./api";

export const loginUser = (payload) => API.post("/auth/login", payload);
export const registerUser = (payload) => API.post("/auth/register", payload);
export const refreshSession = () => API.post("/auth/refresh");
export const logoutUser = () => API.post("/auth/logout");
export const adminCreateUser = (payload) => API.post("/auth/admin/create-user", payload);
export const requestOrganizerRole = () => API.post("/auth/organizer-request");
export const getOrganizerRequests = () => API.get("/auth/organizer-requests");
export const reviewOrganizerRequest = (userId, action) =>
  API.put(`/auth/organizer-requests/${userId}`, { action });
export const forgotPassword = (payload) =>
  API.post("/auth/forgot-password", payload);
export const resetPassword = (payload) =>
  API.post("/auth/reset-password", payload);
export const updateProfile = (payload) => API.put("/auth/profile", payload);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return API.put("/auth/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
