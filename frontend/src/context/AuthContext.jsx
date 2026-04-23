import { createContext, useEffect, useMemo, useState } from "react";
import { logoutUser, refreshSession } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    (() => {
      try {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        localStorage.removeItem("user");
        return null;
      }
    })(),
  );

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const saved = localStorage.getItem("user");
      if (!saved) return;

      try {
        const response = await refreshSession();
        if (isMounted) {
          localStorage.setItem("user", JSON.stringify(response.data));
          setUser(response.data);
        }
      } catch {
        localStorage.removeItem("user");
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
      localStorage.removeItem("user");
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
