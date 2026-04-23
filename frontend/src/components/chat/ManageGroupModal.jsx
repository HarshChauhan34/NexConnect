function ManageGroupModal({
  showManageModal,
  selectedChat,
  setShowManageModal,
  setManageSearch,
  setManageSearchResults,
  renameValue,
  setRenameValue,
  isGroupAdmin,
  updatingGroup,
  handleRenameGroup,
  user,
  handleRemoveMember,
  manageSearch,
  handleManageSearch,
  manageSearchResults,
  handleAddMember,
}) {
  if (!showManageModal || !selectedChat?.isGroupChat) return null;

  const handleCloseModal = () => {
    setShowManageModal(false);
    setManageSearch("");
    setManageSearchResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative my-4 w-full max-w-3xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute top-10 right-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-xl shadow-lg">
                  ⚙️
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Manage Group
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Rename your group, manage members, and invite new people.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-8">
            {/* Rename Section */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Group Details
                </h3>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-300">
                  {isGroupAdmin ? "Admin Access" : "View Access"}
                </span>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Group Name
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  disabled={!isGroupAdmin}
                  className="w-full flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />

                <button
                  onClick={handleRenameGroup}
                  disabled={!isGroupAdmin || updatingGroup}
                  className="rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingGroup ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Members</h3>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                  {selectedChat.users.length} members
                </span>
              </div>

              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {selectedChat.users.map((member) => {
                  const adminId =
                    selectedChat.groupAdmin?._id || selectedChat.groupAdmin;

                  const isMemberAdmin = member._id === adminId;
                  const isCurrentUser = member._id === user._id;

                  return (
                    <div
                      key={member._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-900/70"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-sm font-bold text-white shadow-md">
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                {member.name}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-300">
                                  You
                                </span>
                              )}

                              {isMemberAdmin && (
                                <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                                  Admin
                                </span>
                              )}
                            </div>

                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(isGroupAdmin || isCurrentUser) &&
                            !isMemberAdmin && (
                              <button
                                onClick={() => handleRemoveMember(member)}
                                disabled={updatingGroup}
                                className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25"
                              >
                                {isCurrentUser ? "Leave" : "Remove"}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Members Section */}
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Add Members
                </h3>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                  Invite users
                </span>
              </div>

              <input
                type="text"
                placeholder="Search users to add"
                value={manageSearch}
                onChange={(e) => handleManageSearch(e.target.value)}
                disabled={!isGroupAdmin}
                className="mb-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />

              <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
                {manageSearchResults.map((u) => (
                  <div
                    key={u._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-900/70"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-sm font-bold text-white shadow-md">
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

                      <button
                        onClick={() => handleAddMember(u)}
                        disabled={!isGroupAdmin || updatingGroup}
                        className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}

                {manageSearch && manageSearchResults.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No available users found.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Try another name or email address.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageGroupModal;
