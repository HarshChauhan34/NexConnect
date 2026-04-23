import API from "./api";

export const searchUsers = async (search) => {
  return await API.get(`/auth/users?search=${search}`);
};

export const accessChat = async (userId) => {
  return await API.post("/chat", { userId });
};

export const fetchChats = async () => {
  return await API.get("/chat");
};

export const createGroupChat = async (groupData) => {
  return await API.post("/chat/group", groupData);
};

export const renameGroup = async (chatId, chatName) => {
  return await API.put("/chat/rename", { chatId, chatName });
};

export const addToGroup = async (chatId, userId) => {
  return await API.put("/chat/group-add", { chatId, userId });
};

export const removeFromGroup = async (chatId, userId) => {
  return await API.put("/chat/group-remove", { chatId, userId });
};