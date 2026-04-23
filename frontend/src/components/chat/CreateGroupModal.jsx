function CreateGroupModal({
  showGroupModal,
  setShowGroupModal,
  groupName,
  setGroupName,
  groupSearch,
  handleGroupSearch,
  selectedGroupUsers,
  handleRemoveFromGroupSelection,
  groupSearchResults,
  handleAddToGroupSelection,
  handleCreateGroup,
  creatingGroup,
  setGroupSearch,
  setGroupSearchResults,
  setSelectedGroupUsers,
}) {
  if (!showGroupModal) return null;

  const handleCloseModal = () => {
    setShowGroupModal(false);
    setGroupName("");
    setGroupSearch("");
    setGroupSearchResults([]);
    setSelectedGroupUsers([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative my-4 w-full max-w-2xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* Glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute top-10 right-0 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-xl shadow-lg">
                  👥
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Create Group Chat
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Build a new group, add members, and start chatting
                    instantly.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            {/* Group Name */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Group Name
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Search Users */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Add Members
              </label>
              <input
                type="text"
                placeholder="Search users to add"
                value={groupSearch}
                onChange={(e) => handleGroupSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Selected Users */}
            {selectedGroupUsers.length > 0 && (
              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Selected Members
                  </h3>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300">
                    {selectedGroupUsers.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedGroupUsers.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => handleRemoveFromGroupSelection(u)}
                    className="group inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-800 transition hover:bg-violet-100 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-200 dark:hover:bg-violet-950/40"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-500 text-xs font-bold text-white">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                      <span className="font-medium">{u.name}</span>
                      <span className="text-violet-500 group-hover:text-violet-700 dark:text-violet-300 dark:group-hover:text-violet-200">
                        ×
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Search Results
                </h3>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-300">
                  {groupSearchResults.length} users
                </span>
              </div>

              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {groupSearchResults.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No users found yet.
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Search by name or email to add members.
                    </p>
                  </div>
                ) : (
                  groupSearchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => handleAddToGroupSelection(u)}
                      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-900/70"
                    >
                      <div className="flex items-center justify-between gap-3">
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

                        <div className="rounded-xl bg-cyan-100 px-3 py-1.5 text-xs font-medium text-cyan-700 transition group-hover:bg-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:group-hover:bg-cyan-500/20">
                          Add
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleCloseModal}
                className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateGroup}
                disabled={creatingGroup}
                className="w-full rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {creatingGroup ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
