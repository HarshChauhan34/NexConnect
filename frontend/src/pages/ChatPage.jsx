import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import ManageGroupModal from "../components/chat/ManageGroupModal";

import useChatPageState from "../hooks/useChatPageState";
import useChatData from "../hooks/useChatData";
import useChatSocket from "../hooks/useChatSocket";
import useChatActions from "../hooks/useChatActions";
import {
  getChatName,
  getOtherUser,
  getLatestMessagePreview,
  formatTime,
  formatLastSeen,
  getUnreadCount,
  getMessageStatus,
} from "../hooks/useChatHelpers";
import { useNotifications } from "../context/useNotifications";

function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();

  const state = useChatPageState();

  const {
    search,
    setSearch,
    searchResults,
    setSearchResults,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    loadingSearch,
    setLoadingSearch,
    messages,
    setMessages,
    messageText,
    setMessageText,
    loadingMessages,
    setLoadingMessages,
    sendingMessage,
    setSendingMessage,
    uploadingFile,
    setUploadingFile,
    pendingAttachment,
    setPendingAttachment,
    socketConnected,
    setSocketConnected,
    typing,
    setTyping,
    isTyping,
    setIsTyping,
    unreadCounts,
    setUnreadCounts,
    showGroupModal,
    setShowGroupModal,
    groupName,
    setGroupName,
    groupSearch,
    setGroupSearch,
    groupSearchResults,
    setGroupSearchResults,
    selectedGroupUsers,
    setSelectedGroupUsers,
    creatingGroup,
    setCreatingGroup,
    showManageModal,
    setShowManageModal,
    renameValue,
    setRenameValue,
    manageSearch,
    setManageSearch,
    manageSearchResults,
    setManageSearchResults,
    updatingGroup,
    setUpdatingGroup,
    selectedChatRef,
    bottomRef,
    typingTimeoutRef,
  } = state;

  useChatSocket({
    user,
    selectedChatRef,
    setSocketConnected,
    setIsTyping,
    setChats,
    setMessages,
    setUnreadCounts,
    addNotification,
  });

  useChatData({
    user,
    selectedChat,
    selectedChatRef,
    setChats,
    setMessages,
    setLoadingMessages,
    setUnreadCounts,
    setRenameValue,
    setIsTyping,
    bottomRef,
    messages,
    isTyping,
    setPendingAttachment,
  });

  const handleSelectChat = useCallback(
    (chat) => {
      setSelectedChat(chat);
      setMessages([]);
      setLoadingMessages(Boolean(chat));
    },
    [setSelectedChat, setMessages, setLoadingMessages],
  );

  const actions = useChatActions({
    user,
    logout: async () => {
      await logout();
      navigate("/login");
    },
    chats,
    setChats,
    selectedChat,
    setSelectedChat: handleSelectChat,
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
  });

  const isGroupAdmin =
    selectedChat?.groupAdmin?._id === user?._id ||
    selectedChat?.groupAdmin === user?._id;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Chat Workspace
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Real-time messages, groups, attachments, and reactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                socketConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {socketConnected ? "Connected" : "Connecting..."}
            </span>

            <button
              type="button"
              onClick={() => setShowGroupModal(true)}
              aria-label="Create a new group chat"
              className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Sidebar Column */}
          <div className="h-[55vh] min-h-[420px] xl:h-[calc(100vh-230px)] xl:min-h-[540px]">
            <div className="h-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
              <div className="h-full overflow-hidden p-3 sm:p-4">
                <ChatSidebar
                  search={search}
                  setSearch={setSearch}
                  handleSearch={() => actions.handleSearch(search)}
                  loadingSearch={loadingSearch}
                  searchResults={searchResults}
                  handleAccessChat={actions.handleAccessChat}
                  chats={chats}
                  selectedChat={selectedChat}
                  setSelectedChat={handleSelectChat}
                  user={user}
                  getChatName={getChatName}
                  getOtherUser={getOtherUser}
                  getLatestMessagePreview={getLatestMessagePreview}
                  getUnreadCount={(chat) =>
                    getUnreadCount(unreadCounts, chat._id, chat.unreadCount || 0)
                  }
                />
              </div>
            </div>
          </div>

          {/* Chat Window Column */}
          <div className="h-[65vh] min-h-[460px] xl:h-[calc(100vh-230px)] xl:min-h-[540px]">
            <div className="h-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
              <div className="h-full overflow-hidden p-3 sm:p-4">
                <ChatWindow
                  key={selectedChat?._id || "empty-chat"}
                  selectedChat={selectedChat}
                  user={user}
                  loadingMessages={loadingMessages}
                  messages={messages}
                  isTyping={isTyping}
                  bottomRef={bottomRef}
                  getChatName={getChatName}
                  getOtherUser={getOtherUser}
                  formatLastSeen={formatLastSeen}
                  formatTime={formatTime}
                  getMessageStatus={(msg) =>
                    getMessageStatus(msg, selectedChat, user)
                  }
                  showManageModal={showManageModal}
                  setShowManageModal={setShowManageModal}
                  messageText={messageText}
                  handleTyping={actions.handleTyping}
                  handleSendMessage={actions.handleSendMessage}
                  sendingMessage={sendingMessage}
                  handleFileUpload={actions.handleFileUpload}
                  uploadingFile={uploadingFile}
                  pendingAttachment={pendingAttachment}
                  clearPendingAttachment={actions.clearPendingAttachment}
                  handleReactToMessage={actions.handleReactToMessage}
                  handleDeleteMessage={actions.handleDeleteMessage}
                  handleEditMessage={actions.handleEditMessage}
                />
              </div>
            </div>
          </div>
        </div>
      <CreateGroupModal
        showGroupModal={showGroupModal}
        setShowGroupModal={setShowGroupModal}
        groupName={groupName}
        setGroupName={setGroupName}
        groupSearch={groupSearch}
        handleGroupSearch={actions.handleGroupSearch}
        selectedGroupUsers={selectedGroupUsers}
        handleRemoveFromGroupSelection={actions.handleRemoveFromGroupSelection}
        groupSearchResults={groupSearchResults}
        handleAddToGroupSelection={actions.handleAddToGroupSelection}
        handleCreateGroup={actions.handleCreateGroup}
        creatingGroup={creatingGroup}
        setGroupSearch={setGroupSearch}
        setGroupSearchResults={setGroupSearchResults}
        setSelectedGroupUsers={setSelectedGroupUsers}
      />

      <ManageGroupModal
        showManageModal={showManageModal}
        selectedChat={selectedChat}
        setShowManageModal={setShowManageModal}
        setManageSearch={setManageSearch}
        setManageSearchResults={setManageSearchResults}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        isGroupAdmin={isGroupAdmin}
        updatingGroup={updatingGroup}
        handleRenameGroup={() => actions.handleRenameGroup(renameValue)}
        user={user}
        handleRemoveMember={actions.handleRemoveMember}
        manageSearch={manageSearch}
        handleManageSearch={actions.handleManageSearch}
        manageSearchResults={manageSearchResults}
        handleAddMember={actions.handleAddMember}
      />
    </div>
  );
}

export default ChatPage;
