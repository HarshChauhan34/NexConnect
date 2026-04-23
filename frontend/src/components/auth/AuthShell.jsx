import { motion } from "framer-motion";
import BrandLogo from "../layout/BrandLogo";
import { Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

function AuthShell({ title, subtitle, children, alternateLink }) {
  const MotionDiv = motion.div;

  return (
    <div className="relative min-h-screen overflow-hidden bg-app-gradient px-4 py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl dark:bg-blue-500/15" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col">
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo to="/" />
          <ThemeToggle />
        </div>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-2">
          <MotionDiv
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden space-y-6 lg:block"
          >
            <h1 className="text-5xl font-bold leading-tight text-slate-900 dark:text-slate-100">
              Secure collaboration with modern communication.
            </h1>
            <p className="max-w-lg text-base text-slate-600 dark:text-slate-300">
              Built with accessibility-first UI, role-aware workflows, real-time
              chat, and rich interactions designed for desktop and mobile teams.
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
            {children}
            {alternateLink && (
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                {alternateLink.label}{" "}
                <Link
                  to={alternateLink.to}
                  className="font-semibold text-sky-600 hover:text-sky-500"
                >
                  {alternateLink.cta}
                </Link>
              </p>
            )}
          </MotionDiv>
        </div>
      </div>
    </div>
  );
}

export default AuthShell;
