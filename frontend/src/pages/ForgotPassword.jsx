import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import { forgotPassword } from "../services/authService";
import { validateEmail } from "../utils/validators";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugToken, setDebugToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setDebugToken("");

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email });
      setSuccess(response.data?.message || "Reset instructions sent.");
      if (response.data?.resetToken) {
        setDebugToken(response.data.resetToken);
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We will help you recover account access securely."
      alternateLink={{ label: "Remember your password?", cta: "Sign in", to: "/login" }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            {error}
          </p>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <p>{success}</p>
            {debugToken && (
              <p className="mt-1 break-all text-xs">
                Demo reset token: <span className="font-semibold">{debugToken}</span>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
      >
        Back to sign in
      </Link>
    </AuthShell>
  );
}

export default ForgotPassword;
