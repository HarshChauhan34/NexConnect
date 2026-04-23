import { useEffect, useRef } from "react";
import { socket } from "../socket";
import { markMessagesAsRead } from "../services/messageService";
import toast from "react-hot-toast";
import notificationSound from "../assets/notification.mp3";

function useChatSocket({
  user,
  selectedChatRef,
  setSocketConnected,
  setIsTyping,
  setChats,
  setMessages,
  setUnreadCounts,
  addNotification,
}) {
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("setup", user);
    socket.emit("user online", user._id);

    const onConnected = () => setSocketConnected(true);

    const onTyping = (room) => {
      if (selectedChatRef.current?._id === room) {
        setIsTyping(true);
      }
    };

    const onStopTyping = (room) => {
      if (selectedChatRef.current?._id === room) {
        setIsTyping(false);
      }
    };

    const onMessageReceived = (newMessageReceived) => {
      const currentChat = selectedChatRef.current;
      const isOwnMessage =
        newMessageReceived?.sender?._id?.toString() === user?._id?.toString();
      const chatId = newMessageReceived?.chat?._id;
      if (!chatId) return;

      setChats((prevChats) => {
        const existingChat = prevChats.find(
          (chat) => chat._id === chatId,
        );

        let updatedChats;

        if (existingChat) {
          updatedChats = prevChats.map((chat) =>
            chat._id === chatId
              ? {
                  ...chat,
                  latestMessage: newMessageReceived,
                  unreadCount:
                    isOwnMessage || currentChat?._id === chatId
                      ? 0
                      : (chat.unreadCount || 0) + 1,
                  updatedAt: new Date().toISOString(),
                }
              : chat,
          );
        } else {
          updatedChats = [
            {
              ...newMessageReceived.chat,
              latestMessage: newMessageReceived,
              unreadCount: isOwnMessage || currentChat?._id === chatId ? 0 : 1,
              updatedAt: new Date().toISOString(),
            },
            ...prevChats,
          ];
        }

        return updatedChats.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
      });

      if (isOwnMessage) return;

      const senderName = newMessageReceived.sender?.name || "User";
      const messagePreview =
        newMessageReceived.messageType === "image"
          ? "sent an image"
          : newMessageReceived.messageType === "file"
            ? `sent a file${newMessageReceived.fileName ? `: ${newMessageReceived.fileName}` : ""}`
            : newMessageReceived.content || "sent a new message";

      addNotification?.({
        title: `New message from ${senderName}`,
        message: messagePreview,
      });

      if (currentChat && currentChat._id === chatId) {
        setMessages((prev) => [...prev, newMessageReceived]);

        markMessagesAsRead(currentChat._id).catch(() => {});

        setUnreadCounts((prev) => ({
          ...prev,
          [currentChat._id]: 0,
        }));

        socket.emit("messages seen", {
          chatId: currentChat._id,
          userId: user._id,
        });
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1,
        }));

        toast.success(`New message from ${senderName}`);

        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }
    };

    const onUserOnline = (userId) => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          users: chat.users.map((u) =>
            u._id === userId ? { ...u, isOnline: true } : u,
          ),
        })),
      );
    };

    const onUserOffline = (userId) => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          users: chat.users.map((u) =>
            u._id === userId
              ? { ...u, isOnline: false, lastSeen: new Date().toISOString() }
              : u,
          ),
        })),
      );
    };

    const onMessagesSeen = ({ chatId, userId }) => {
      if (selectedChatRef.current?._id !== chatId) return;

      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          const alreadyRead = msg.readBy?.some((reader) => {
            const id =
              typeof reader === "string"
                ? reader
                : reader?._id || reader?.toString?.();
            return id?.toString() === userId;
          });

          if (alreadyRead) return msg;

          return {
            ...msg,
            readBy: [...(msg.readBy || []), userId],
          };
        }),
      );
    };

    const onMessageReaction = (updatedMessage) => {
      if (selectedChatRef.current?._id !== updatedMessage.chat._id) return;

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );
    };

    const onMessageDeleted = ({ deletedMessageId, chatId, latestMessage }) => {
      if (selectedChatRef.current?._id === chatId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== deletedMessageId),
        );
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                latestMessage: latestMessage || null,
                updatedAt: new Date().toISOString(),
              }
            : chat,
        ),
      );
    };

    const onMessageEdited = (updatedMessage) => {
      if (selectedChatRef.current?._id !== updatedMessage.chat._id) return;

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === updatedMessage.chat._id
            ? {
                ...chat,
                latestMessage:
                  chat.latestMessage?._id === updatedMessage._id
                    ? updatedMessage
                    : chat.latestMessage,
              }
            : chat,
        ),
      );
    };

    socket.on("connected", onConnected);
    socket.on("typing", onTyping);
    socket.on("stop typing", onStopTyping);
    socket.on("message received", onMessageReceived);
    socket.on("message reaction", onMessageReaction);
    socket.on("user online", onUserOnline);
    socket.on("user offline", onUserOffline);
    socket.on("messages seen", onMessagesSeen);
    socket.on("message deleted", onMessageDeleted);
    socket.on("message edited", onMessageEdited);

    return () => {
      socket.emit("user offline", user._id);
      socket.off("connected", onConnected);
      socket.off("typing", onTyping);
      socket.off("stop typing", onStopTyping);
      socket.off("message received", onMessageReceived);
      socket.off("user online", onUserOnline);
      socket.off("user offline", onUserOffline);
      socket.off("messages seen", onMessagesSeen);
      socket.off("message reaction", onMessageReaction);
      socket.off("message deleted", onMessageDeleted);
      socket.off("message edited", onMessageEdited);
    };
  }, [
    user,
    selectedChatRef,
    setSocketConnected,
    setIsTyping,
    setChats,
    setMessages,
    setUnreadCounts,
    addNotification,
  ]);
}

export default useChatSocket;
