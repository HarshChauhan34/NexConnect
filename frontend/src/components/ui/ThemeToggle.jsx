import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/useTheme";

function ThemeToggle() {
  const MotionSpan = motion.span;
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300/70 bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <MotionSpan
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -30, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </MotionSpan>
    </button>
  );
}

export default ThemeToggle;
