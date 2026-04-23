import { createContext, useCallback, useMemo, useState } from "react";

const NotificationContext = createContext();

const starterNotifications = [
  {
    id: "n-1",
    title: "Welcome to the dashboard",
    message: "Your workspace is now ready with role-based access.",
    createdAt: new Date().toISOString(),
    read: false,
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(starterNotifications);

  const addNotification = useCallback((payload) => {
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: payload.title || "Update",
        message: payload.message || "",
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0),
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAllAsRead,
      markAsRead,
    }),
    [notifications, unreadCount, addNotification, markAllAsRead, markAsRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
