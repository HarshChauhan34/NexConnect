import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ThemeToggle from "../ui/ThemeToggle";
import NotificationMenu from "../ui/NotificationMenu";
import BrandLogo from "./BrandLogo";

const appLinks = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/chat", label: "Chat" },
  { to: "/app/events", label: "Events" },
  { to: "/app/products", label: "Products" },
];

function Navbar() {
  const MotionDiv = motion.div;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = useMemo(() => (user ? appLinks : []), [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo to={user ? "/app/dashboard" : "/"} />

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationMenu />}

          {user ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/80 px-2 py-1.5 text-left shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900"
              >
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                      user.name || "User",
                    )}`
                  }
                  alt="Profile avatar"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="max-w-27.5 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/app/profile");
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate("/login");
                      }}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      Logout
                    </button>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/70 bg-white/80 text-slate-700 shadow-sm md:hidden dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            aria-label="Open mobile menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <MotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200/70 px-4 py-3 md:hidden dark:border-slate-800/80"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "text-slate-700 dark:text-slate-300"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/app/profile");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                      navigate("/login");
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 dark:text-rose-400"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
