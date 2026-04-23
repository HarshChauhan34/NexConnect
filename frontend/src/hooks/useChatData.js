import { useCallback, useEffect } from "react";
import { fetchChats } from "../services/chatService";
import { fetchMessages, markMessagesAsRead } from "../services/messageService";
import { socket } from "../socket";

function useChatData({
  user,
  selectedChat,
  selectedChatRef,
  setChats,
  setMessages,
  setLoadingMessages,
  setUnreadCounts,
  setRenameValue,
  setIsTyping,
  setPendingAttachment,
  bottomRef,
  messages,
  isTyping,
}) {
  const loadChats = useCallback(async () => {
    try {
      const res = await fetchChats();
      const chats = res.data || [];
      setChats(chats);

      setUnreadCounts(
        chats.reduce((acc, chat) => {
          acc[chat._id] = chat.unreadCount || 0;
          return acc;
        }, {}),
      );
    } catch (error) {
      console.log(error);
    }
  }, [setChats, setUnreadCounts]);

  const loadMessages = useCallback(async (chatId) => {
    try {
      setLoadingMessages(true);
      const res = await fetchMessages(chatId);
      setMessages(res.data);
      socket.emit("join chat", chatId);

      await markMessagesAsRead(chatId);
      socket.emit("messages seen", {
        chatId,
        userId: user._id,
      });

      setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, [setLoadingMessages, setMessages, setUnreadCounts, user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    setRenameValue(selectedChat?.chatName || "");
  }, [selectedChat, selectedChatRef, setRenameValue]);

  useEffect(() => {
    if (selectedChat?._id) {
      loadMessages(selectedChat._id);
      setIsTyping(false);
      setPendingAttachment(null);
    }
  }, [selectedChat?._id, loadMessages, setIsTyping, setPendingAttachment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, bottomRef]);

  return {
    loadChats,
    loadMessages,
  };
}

export default useChatData;
