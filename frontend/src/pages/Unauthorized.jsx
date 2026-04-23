import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-app-gradient">
      <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <ShieldAlert />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Unauthorized Access
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Your role does not have permission to open this page.
        </p>
        <Link
          to="/app/dashboard"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
