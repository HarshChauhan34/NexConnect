import API from "./api";

export const sendMessage = async (messageData) => {
  return await API.post("/message", messageData);
};

export const fetchMessages = async (chatId) => {
  return await API.get(`/message/${chatId}`);
};

export const uploadChatFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await API.post("/message/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const markMessagesAsRead = async (chatId) => {
  return await API.post("/message/read", { chatId });
};

export const reactToMessage = async (messageId, emoji) => {
  return await API.post("/message/react", { messageId, emoji });
};

export const deleteMessage = async (messageId) => {
  return await API.delete("/message", {
    data: { messageId },
  });
};

export const editMessage = async (messageId, content) => {
  return await API.put("/message", { messageId, content });
};

export const getFileAccessUrl = async ({
  fileUrl,
  fileName,
  download = false,
}) => {
  return await API.post("/message/file-url", {
    fileUrl,
    fileName,
    download,
  });
};
