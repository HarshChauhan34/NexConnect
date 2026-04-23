function ChatSidebar({
  search,
  setSearch,
  handleSearch,
  loadingSearch,
  searchResults,
  handleAccessChat,
  chats,
  selectedChat,
  setSelectedChat,
  user,
  getChatName,
  getOtherUser,
  getLatestMessagePreview,
  getUnreadCount,
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg dark:border-slate-800 dark:bg-slate-950/70">
      <div className="shrink-0 border-b border-slate-200/80 bg-slate-50/90 px-4 py-4 sm:px-5 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg shadow-blue-600/30">
            <span className="text-lg text-white">🔎</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">
              Search Users
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
              Find people and start new conversations
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            onClick={handleSearch}
            className="rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5"
          >
            Search
          </button>
        </div>

        {loadingSearch && (
          <div className="mt-3">
            <p className="animate-pulse text-sm text-sky-600 dark:text-sky-300">
              Searching...
            </p>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="shrink-0 border-b border-slate-200/80 px-4 py-4 sm:px-5 dark:border-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Search Results
            </h3>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
              {searchResults.length} found
            </span>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {searchResults.map((u) => (
              <div
                key={u._id}
                onClick={() => handleAccessChat(u._id)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-sky-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-900/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-md">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                          {u.name}
                        </p>
                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`mt-1 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs ${
                      u.isOnline
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        u.isOnline ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                      }`}
                    />
                    {u.isOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="shrink-0 px-4 pb-3 pt-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-slate-100">
              My Chats
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              Recent personal and group conversations
            </p>
          </div>

          <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
            {chats.length} chats
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 pb-4 sm:px-5">
        <div className="h-full space-y-3 overflow-y-auto pr-1">
          {chats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-300">No chats yet.</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Search users to start a conversation.
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = getOtherUser(chat, user);
              const unreadCount = getUnreadCount(chat);

              return (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`group cursor-pointer rounded-2xl border p-3.5 transition ${
                    selectedChat?._id === chat._id
                      ? "border-sky-300 bg-sky-50 shadow-md dark:border-sky-900/40 dark:bg-sky-950/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-md">
                        {getChatName(chat, user)?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                            {getChatName(chat, user)}
                          </p>

                          {chat.isGroupChat && (
                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                              Group
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 truncate text-sm ${
                            selectedChat?._id === chat._id
                              ? "text-sky-700 dark:text-sky-300"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {getLatestMessagePreview(chat)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {!chat.isGroupChat && (
                        <div
                          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] ${
                            otherUser?.isOnline
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : "border border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              otherUser?.isOnline
                                ? "bg-emerald-500"
                                : "bg-slate-400 dark:bg-slate-500"
                            }`}
                          />
                          {otherUser?.isOnline ? "Online" : "Offline"}
                        </div>
                      )}

                      {unreadCount > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-bold text-white shadow-md">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatSidebar;
