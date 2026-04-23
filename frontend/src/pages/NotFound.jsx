import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-app-gradient">
      <div className="w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
        <p className="text-xs font-semibold tracking-wider text-sky-600 dark:text-sky-300">
          ERROR 404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
