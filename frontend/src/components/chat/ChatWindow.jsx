import { useCallback, useEffect, useRef, useState } from "react";
import { getFileAccessUrl } from "../../services/messageService";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function ChatWindow({
  selectedChat,
  user,
  loadingMessages,
  messages,
  isTyping,
  bottomRef,
  getChatName,
  getOtherUser,
  formatLastSeen,
  formatTime,
  getMessageStatus,
  showManageModal,
  setShowManageModal,
  messageText,
  handleTyping,
  handleSendMessage,
  sendingMessage,
  handleFileUpload,
  uploadingFile,
  pendingAttachment,
  clearPendingAttachment,
  handleReactToMessage,
  handleDeleteMessage,
  handleEditMessage,

  // optional infinite scroll props
  loadOlderMessages,
  hasMoreMessages = false,
  loadingOlderMessages = false,
}) {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  const messagesContainerRef = useRef(null);
  const previousMessagesLengthRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const contextMenuRef = useRef(null);

  const getReactionSummary = (reactions = []) => {
    const grouped = reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped);
  };

  const formatAttachmentSize = (bytes = 0) => {
    if (!bytes || Number.isNaN(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getOpenableFileUrl = (url) => {
    if (!url) return "";
    // Backward-compatible fix for old messages saved with authenticated delivery URLs.
    return url
      .replace("/image/authenticated/", "/image/upload/")
      .replace("/raw/authenticated/", "/raw/upload/");
  };

  const handleOpenFile = async (msg, download = false) => {
    const fallbackUrl = getOpenableFileUrl(msg.fileUrl);
    if (!fallbackUrl) return;

    try {
      const response = await getFileAccessUrl({
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        download,
      });
      const signedUrl = response?.data?.url || fallbackUrl;
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.content || "");
    setContextMenu(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const submitEdit = async (messageId) => {
    await handleEditMessage(messageId, editText);
    cancelEditing();
  };

  const selectedChatId = selectedChat?._id;

  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      if (bottomRef?.current) {
        bottomRef.current.scrollIntoView({
          behavior,
          block: "end",
        });
      }
    });
  }, [bottomRef]);

  const isNearBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  useEffect(() => {
    if (!selectedChatId || loadingMessages) return;

    const currentLength = messages?.length || 0;
    const prevLength = previousMessagesLengthRef.current;

    if (isInitialLoadRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom("auto");
        isInitialLoadRef.current = false;
        previousMessagesLengthRef.current = currentLength;
      });
      return;
    }

    if (currentLength > prevLength && !loadingMoreRef.current) {
      if (isNearBottom()) {
        scrollToBottom("smooth");
      }
    }

    previousMessagesLengthRef.current = currentLength;
  }, [messages, selectedChatId, loadingMessages, scrollToBottom, isNearBottom]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    previousMessagesLengthRef.current = 0;
    loadingMoreRef.current = false;
  }, [selectedChatId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenu(null);
      }
    };

    const handleWindowScroll = () => setContextMenu(null);
    const handleEscape = (e) => {
      if (e.key === "Escape") setContextMenu(null);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleWindowScroll, true);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  }, []);

  const handleMessagesScroll = async (e) => {
    const container = e.currentTarget;
    setContextMenu(null);

    if (
      container.scrollTop < 50 &&
      hasMoreMessages &&
      !loadingOlderMessages &&
      typeof loadOlderMessages === "function"
    ) {
      const prevScrollHeight = container.scrollHeight;
      loadingMoreRef.current = true;

      await loadOlderMessages();

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight;
        loadingMoreRef.current = false;
      });
    }
  };

  const getSafeMenuPosition = (clientX, clientY) => {
    const containerRect =
      messagesContainerRef.current?.getBoundingClientRect() || {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

    const menuWidth = 260;
    const menuHeight = 220;

    let x = clientX - containerRect.left;
    let y = clientY - containerRect.top;

    if (x + menuWidth > containerRect.width) {
      x = containerRect.width - menuWidth - 12;
    }

    if (y + menuHeight > containerRect.height) {
      y = containerRect.height - menuHeight - 12;
    }

    x = Math.max(12, x);
    y = Math.max(12, y);

    return { x, y };
  };

  const handleMessageRightClick = (e, msg, isMine) => {
    e.preventDefault();

    const { x, y } = getSafeMenuPosition(e.clientX, e.clientY);

    setContextMenu({
      message: msg,
      isMine,
      x,
      y,
    });
  };

  const handleContextReaction = async (emoji) => {
    if (!contextMenu?.message?._id) return;
    await handleReactToMessage(contextMenu.message._id, emoji);
    setContextMenu(null);
  };

  const handleContextDelete = async () => {
    if (!contextMenu?.message?._id) return;
    await handleDeleteMessage(contextMenu.message._id);
    setContextMenu(null);
  };

  const handleContextEdit = () => {
    if (!contextMenu?.message) return;
    startEditing(contextMenu.message);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg dark:border-slate-800 dark:bg-slate-950/70">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-50/90 px-4 py-4 sm:px-5 dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-base font-bold text-white shadow-lg">
                    {getChatName(selectedChat, user)
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
                      {getChatName(selectedChat, user)}
                    </h2>

                    {selectedChat.isGroupChat ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                          Group Chat
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {selectedChat.users.length} members
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        {getOtherUser(selectedChat, user)?.isOnline ? (
                          <>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                              Online
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatLastSeen(
                                getOtherUser(selectedChat, user)?.lastSeen,
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedChat.isGroupChat && (
                <button
                  onClick={() => setShowManageModal(!showManageModal)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Manage Group
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="relative min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 scroll-smooth dark:bg-slate-900/40 sm:p-5"
          >
            {loadingOlderMessages && (
              <div className="mb-4 flex justify-center">
                <div className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Loading older messages...
                </div>
              </div>
            )}

            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <div className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Loading messages...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500/20 via-purple-500/20 to-cyan-500/20 text-2xl">
                    💬
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    No messages yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Start the conversation by sending your first message.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMine = msg.sender._id === user._id;
                  const reactionSummary = getReactionSummary(msg.reactions);
                  const isEditing = editingMessageId === msg._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[90%] sm:max-w-[78%] lg:max-w-[72%]">
                        <div
                          onContextMenu={(e) =>
                            handleMessageRightClick(e, msg, isMine)
                          }
                          className={`cursor-context-menu rounded-3xl px-4 py-3 shadow-lg transition ${
                            isMine
                              ? "rounded-br-md bg-linear-to-r from-cyan-500 to-blue-600 text-white"
                              : "rounded-bl-md border border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {!isMine && (
                            <div className="mb-2 flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-xs font-bold text-white">
                                {msg.sender.name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                                {msg.sender.name}
                              </p>
                            </div>
                          )}

                          {msg.messageType === "image" ? (
                            <div className="space-y-3">
                              <img
                                src={getOpenableFileUrl(msg.fileUrl)}
                                alt={msg.fileName || "chat image"}
                                className="max-h-80 w-full rounded-2xl border border-slate-300 object-cover dark:border-slate-700"
                              />
                              {msg.fileName && (
                                <p className="break-all text-xs text-slate-500 dark:text-slate-300">
                                  {msg.fileName}
                                </p>
                              )}
                              {msg.content?.trim() && (
                                <p className="break-words text-[15px] leading-relaxed">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                          ) : msg.messageType === "file" ? (
                            <div className="space-y-3">
                              <div
                                className={`rounded-2xl p-3 ${
                                  isMine
                                    ? "border border-white/30 bg-white/15"
                                    : "border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                                }`}
                              >
                                <p
                                  className={`break-all text-sm font-medium ${
                                    isMine
                                      ? "text-white"
                                      : "text-slate-900 dark:text-slate-100"
                                  }`}
                                >
                                  {msg.fileName || "File"}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenFile(msg, false)}
                                    className={`rounded-xl px-3 py-1.5 transition ${
                                      isMine
                                        ? "bg-white/20 text-white hover:bg-white/30"
                                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/30"
                                    }`}
                                  >
                                    Open
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenFile(msg, true)}
                                    className={`rounded-xl px-3 py-1.5 transition ${
                                      isMine
                                        ? "bg-white/20 text-white hover:bg-white/30"
                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
                                    }`}
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                              {msg.content?.trim() && (
                                <p className="break-words text-[15px] leading-relaxed">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                          ) : isEditing ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => submitEdit(msg._id)}
                                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                    isMine
                                      ? "bg-white/20 text-white hover:bg-white/30"
                                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/30"
                                  }`}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                                    isMine
                                      ? "bg-white/20 text-white hover:bg-white/30"
                                      : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-500/20 dark:text-slate-200 dark:hover:bg-slate-500/30"
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="break-words text-[15px] leading-relaxed">
                              {msg.content}
                            </p>
                          )}

                          {reactionSummary.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {reactionSummary.map(([emoji, count]) => (
                                <span
                                  key={emoji}
                                  className={`rounded-full px-2.5 py-1 text-xs ${
                                    isMine
                                      ? "border border-white/20 bg-white/20 text-white"
                                      : "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  {emoji} {count}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 flex flex-col items-end gap-1">
                            <p
                              className={`text-[11px] ${
                                isMine
                                  ? "text-white/80"
                                  : "text-slate-500 dark:text-slate-300"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                              {msg.edited ? " • edited" : ""}
                            </p>

                            {msg.sender._id === user._id && (
                              <p
                                className={`text-[10px] font-semibold ${
                                  getMessageStatus(msg) === "✔✔ Seen"
                                    ? "text-emerald-200"
                                    : isMine
                                      ? "text-white/80"
                                      : "text-slate-500 dark:text-slate-300"
                                }`}
                              >
                                {getMessageStatus(msg)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm italic text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      Typing...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
              <div
                ref={contextMenuRef}
                className="absolute z-50 w-65 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-950/95"
                style={{
                  left: `${contextMenu.x}px`,
                  top: `${contextMenu.y}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Message Actions
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    React or manage this message
                  </p>
                </div>

                <div className="px-4 py-3">
                  <p className="mb-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                    Quick Reactions
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleContextReaction(emoji)}
                        className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-xl transition hover:scale-[1.03] hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
                  {contextMenu.isMine &&
                    contextMenu.message?.messageType === "text" && (
                      <button
                        type="button"
                        onClick={handleContextEdit}
                        className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-500/15"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-base dark:bg-amber-500/20">
                          ✏️
                        </span>
                        <span>Edit Message</span>
                      </button>
                    )}

                  {contextMenu.isMine && (
                    <button
                      type="button"
                      onClick={handleContextDelete}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-500/15"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-base dark:bg-rose-500/20">
                        🗑️
                      </span>
                      <span>Delete Message</span>
                    </button>
                  )}

                  {!contextMenu.isMine && (
                    <div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                      You can react to this message.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="shrink-0 border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                {pendingAttachment ? "Change File" : "Attach File"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile || sendingMessage}
                />
              </label>

              <div className="w-full flex-1 space-y-2">
                {pendingAttachment && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-900/40 dark:bg-sky-950/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-sky-800 dark:text-sky-200">
                        {pendingAttachment.name}
                      </p>
                      <p className="text-xs text-sky-700/90 dark:text-sky-300">
                        {formatAttachmentSize(pendingAttachment.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearPendingAttachment}
                      className="shrink-0 rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900/50"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={handleTyping}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={
                  sendingMessage ||
                  uploadingFile ||
                  (!messageText.trim() && !pendingAttachment)
                }
                className="rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingMessage || uploadingFile
                  ? "Sending..."
                  : pendingAttachment && !messageText.trim()
                    ? "Send File"
                    : "Send"}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center bg-slate-50/70 p-6 dark:bg-slate-900/40">
          <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500/20 via-purple-500/20 to-cyan-500/20 text-3xl">
              ✨
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Select a chat to start messaging
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Choose a conversation from the sidebar and begin your real-time
              chat experience.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
