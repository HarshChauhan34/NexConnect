import { createContext, useEffect, useMemo, useState } from "react";
import { logoutUser, refreshSession } from "../services/authService";

const AuthContext = createContext();
const STORAGE_KEY = "user";

const readStoredUser = () => {
  try {
    const sessionUser = sessionStorage.getItem(STORAGE_KEY);
    if (sessionUser) return JSON.parse(sessionUser);

    // Backward compatibility: migrate old localStorage session to sessionStorage.
    const legacyUser = localStorage.getItem(STORAGE_KEY);
    if (!legacyUser) return null;

    sessionStorage.setItem(STORAGE_KEY, legacyUser);
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(legacyUser);
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const login = (userData) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      try {
        const response = await refreshSession();
        if (isMounted) {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
          setUser(response.data);
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
        if (isMounted) setUser(null);
      }
    };

    bootstrapSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore client-side cleanup fallback
    } finally {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
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
