import { Bell, CheckCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNotifications } from "../../context/useNotifications";

function NotificationMenu() {
  const MotionDiv = motion.div;
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/70 bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 z-50 mt-3 w-80 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-500"
              >
                <CheckCheck size={14} />
                Mark all
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {notifications.length === 0 && (
                <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  No notifications yet.
                </p>
              )}

              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markAsRead(item.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    item.read
                      ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      : "border-sky-200 bg-sky-50 dark:border-sky-900/40 dark:bg-sky-950/30"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {item.message}
                  </p>
                </button>
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationMenu;
