import {
  searchUsers,
  accessChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../services/chatService";
import {
  sendMessage as sendMessageAPI,
  uploadChatFile,
  reactToMessage,
  deleteMessage as deleteMessageAPI,
  editMessage as editMessageAPI,
} from "../services/messageService";
import { socket } from "../socket";

function useChatActions({
  user,
  logout,
  chats,
  setChats,
  selectedChat,
  setSelectedChat,
  setSearch,
  setSearchResults,
  setMessages,
  setMessageText,
  setLoadingSearch,
  setCreatingGroup,
  setShowGroupModal,
  setGroupName,
  setGroupSearch,
  setGroupSearchResults,
  setSelectedGroupUsers,
  setUpdatingGroup,
  setManageSearch,
  setManageSearchResults,
  setShowManageModal,
  setSendingMessage,
  setUploadingFile,
  pendingAttachment,
  setPendingAttachment,
  typing,
  setTyping,
  socketConnected,
  typingTimeoutRef,
  messageText,
  groupName,
  selectedGroupUsers,
}) {
  const handleSearch = async (search) => {
    if (!search.trim()) return;
    try {
      setLoadingSearch(true);
      const res = await searchUsers(search);
      setSearchResults(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Search failed");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleAccessChat = async (userId) => {
    try {
      const res = await accessChat(userId);
      const exists = chats.find((chat) => chat._id === res.data._id);
      if (!exists) setChats((prev) => [res.data, ...prev]);

      setSelectedChat(res.data);
      setSearchResults([]);
      setSearch("");
    } catch (error) {
      alert(error.response?.data?.message || "Chat access failed");
    }
  };

  const handleGroupSearch = async (value) => {
    setGroupSearch(value);
    if (!value.trim()) return setGroupSearchResults([]);

    try {
      const res = await searchUsers(value);
      setGroupSearchResults(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleManageSearch = async (value) => {
    setManageSearch(value);
    if (!value.trim()) return setManageSearchResults([]);

    try {
      const res = await searchUsers(value);
      const filtered = res.data.filter(
        (u) => !selectedChat?.users?.some((member) => member._id === u._id),
      );
      setManageSearchResults(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddToGroupSelection = (userToAdd) => {
    setSelectedGroupUsers((prev) => {
      const exists = prev.find((u) => u._id === userToAdd._id);
      return exists ? prev : [...prev, userToAdd];
    });
  };

  const handleRemoveFromGroupSelection = (userToRemove) => {
    setSelectedGroupUsers((prev) =>
      prev.filter((u) => u._id !== userToRemove._id),
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert("Please enter group name");
    if (selectedGroupUsers.length < 2) {
      return alert("Please select at least 2 users");
    }

    try {
      setCreatingGroup(true);
      const res = await createGroupChat({
        name: groupName,
        users: selectedGroupUsers.map((u) => u._id),
      });

      setChats((prev) => {
        const exists = prev.find((chat) => chat._id === res.data._id);
        if (exists) return prev;
        return [res.data, ...prev];
      });

      setSelectedChat(res.data);
      setShowGroupModal(false);
      setGroupName("");
      setGroupSearch("");
      setGroupSearchResults([]);
      setSelectedGroupUsers([]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleRenameGroup = async (renameValue) => {
    if (!selectedChat?._id || !renameValue.trim()) return;

    try {
      setUpdatingGroup(true);
      const res = await renameGroup(selectedChat._id, renameValue);
      setSelectedChat(res.data);
      setChats((prev) =>
        prev.map((chat) => (chat._id === res.data._id ? res.data : chat)),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Rename failed");
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleAddMember = async (userToAdd) => {
    if (!selectedChat?._id) return;

    try {
      setUpdatingGroup(true);
      const res = await addToGroup(selectedChat._id, userToAdd._id);
      setSelectedChat(res.data);
      setChats((prev) =>
        prev.map((chat) => (chat._id === res.data._id ? res.data : chat)),
      );
      setManageSearch("");
      setManageSearchResults([]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add member");
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!selectedChat?._id) return;

    try {
      setUpdatingGroup(true);
      const res = await removeFromGroup(selectedChat._id, member._id);

      const currentUserStillInGroup = res.data.users.some(
        (u) => u._id === user._id,
      );

      setChats((prev) =>
        prev
          .map((chat) => (chat._id === res.data._id ? res.data : chat))
          .filter((chat) =>
            chat._id === res.data._id ? currentUserStillInGroup : true,
          ),
      );

      if (currentUserStillInGroup) {
        setSelectedChat(res.data);
      } else {
        setSelectedChat(null);
        setMessages([]);
        setShowManageModal(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove member");
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessageText(value);

    if (!socketConnected || !selectedChat?._id) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedChat?._id) return;

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage && !pendingAttachment) return;

    try {
      setSendingMessage(true);

      if (typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }

      let payload = {
        content: trimmedMessage,
        chatId: selectedChat._id,
      };

      if (pendingAttachment?.file) {
        setUploadingFile(true);
        const uploadRes = await uploadChatFile(pendingAttachment.file);

        payload = {
          ...payload,
          fileUrl: uploadRes.data.fileUrl,
          fileName: uploadRes.data.fileName,
          messageType: uploadRes.data.messageType,
        };
      }

      const res = await sendMessageAPI(payload);

      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
      setPendingAttachment(null);

      setChats((prevChats) =>
        prevChats
          .map((chat) =>
            chat._id === selectedChat._id
              ? {
                  ...chat,
                  latestMessage: res.data,
                  updatedAt: new Date().toISOString(),
                }
              : chat,
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );

      socket.emit("new message", res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send message");
    } finally {
      setUploadingFile(false);
      setSendingMessage(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedChat?._id) {
      alert("Select a chat first");
      e.target.value = "";
      return;
    }

    setPendingAttachment({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    e.target.value = "";
  };

  const clearPendingAttachment = () => setPendingAttachment(null);

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      const res = await reactToMessage(messageId, emoji);
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? res.data : msg)),
      );
      socket.emit("message reaction", res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Reaction failed");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm("Delete this message?");
    if (!confirmDelete) return;

    try {
      const res = await deleteMessageAPI(messageId);

      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId),
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === res.data.chatId
            ? {
                ...chat,
                latestMessage: res.data.latestMessage,
                updatedAt: new Date().toISOString(),
              }
            : chat,
        ),
      );

      socket.emit("message deleted", {
        deletedMessageId: res.data.deletedMessageId,
        chatId: res.data.chatId,
        latestMessage: res.data.latestMessage,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleEditMessage = async (messageId, content) => {
    if (!content.trim()) return;

    try {
      const res = await editMessageAPI(messageId, content);

      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? res.data : msg)),
      );

      socket.emit("message edited", res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Edit failed");
    }
  };

  const handleLogout = () => {
    if (user?._id) socket.emit("user offline", user._id);
    logout();
  };

  return {
    handleSearch,
    handleAccessChat,
    handleGroupSearch,
    handleManageSearch,
    handleAddToGroupSelection,
    handleRemoveFromGroupSelection,
    handleCreateGroup,
    handleRenameGroup,
    handleAddMember,
    handleRemoveMember,
    handleTyping,
    handleSendMessage,
    handleFileUpload,
    clearPendingAttachment,
    handleReactToMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleLogout,
  };
}

export default useChatActions;
