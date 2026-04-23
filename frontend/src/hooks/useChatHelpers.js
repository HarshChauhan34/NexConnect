export const getChatName = (chat, currentUser) => {
  if (chat.isGroupChat) return chat.chatName;
  const otherUser = chat.users.find((u) => u._id !== currentUser._id);
  return otherUser?.name || "Unknown User";
};

export const getOtherUser = (chat, currentUser) => {
  if (chat.isGroupChat) return null;
  return chat.users.find((u) => u._id !== currentUser._id);
};

export const getLatestMessagePreview = (chat) => {
  if (!chat.latestMessage) return "No messages yet";
  if (chat.latestMessage.messageType === "image") return "📷 Image";
  if (chat.latestMessage.messageType === "file") return "📎 File";
  return chat.latestMessage.content || "No messages yet";
};

export const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatLastSeen = (dateString) => {
  if (!dateString) return "Offline";
  return `Last seen ${new Date(dateString).toLocaleString()}`;
};

export const isMessageSeen = (msg, selectedChat, currentUser) => {
  if (!msg?.readBy || !selectedChat?.users) return false;

  const otherUsers = selectedChat.users.filter((u) => u._id !== currentUser._id);
  if (otherUsers.length === 0) return false;

  return otherUsers.every((otherUser) =>
    msg.readBy.some((reader) => {
      const readerId =
        typeof reader === "string"
          ? reader
          : reader?._id || reader?.toString?.();
      return readerId?.toString() === otherUser._id.toString();
    })
  );
};

export const getUnreadCount = (unreadCounts, chatId, fallback = 0) =>
  unreadCounts[chatId] ?? fallback ?? 0;

export const getMessageStatus = (msg, selectedChat, currentUser) => {
  if (!msg || msg.sender._id !== currentUser._id) return "";

  const otherUsers =
    selectedChat?.users?.filter((u) => u._id !== currentUser._id) || [];

  if (otherUsers.length === 0) {
    return "✔ Sent";
  }

  const seenByAll = otherUsers.every((otherUser) =>
    (msg.readBy || []).some((reader) => {
      const readerId =
        typeof reader === "string"
          ? reader
          : reader?._id || reader?.toString?.();
      return readerId?.toString() === otherUser._id.toString();
    })
  );

  if (seenByAll) return "✔✔ Seen";

  return "✔✔ Delivered";
};
