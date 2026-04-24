import { createContext, useEffect, useMemo, useState } from "react";
import { logoutUser, refreshSession } from "../services/authService";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  USER_STORAGE_KEY,
} from "../constants/auth";

const AuthContext = createContext();

const readStoredUser = () => {
  try {
    const sessionUser = sessionStorage.getItem(USER_STORAGE_KEY);
    if (sessionUser) return JSON.parse(sessionUser);

    // Backward compatibility: migrate old localStorage session to sessionStorage.
    const legacyUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!legacyUser) return null;

    sessionStorage.setItem(USER_STORAGE_KEY, legacyUser);
    localStorage.removeItem(USER_STORAGE_KEY);
    return JSON.parse(legacyUser);
  } catch {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const login = (userData) => {
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const saved = sessionStorage.getItem(USER_STORAGE_KEY);
      if (!saved) return;

      try {
        const response = await refreshSession();
        if (isMounted) {
          sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
          setUser(response.data);
        }
      } catch {
        sessionStorage.removeItem(USER_STORAGE_KEY);
        if (isMounted) setUser(null);
      }
    };

    bootstrapSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore client-side cleanup fallback
    } finally {
      sessionStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
