import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/useAuth";
import { useNotifications } from "../context/useNotifications";
import { loginUser } from "../services/authService";
import { validateEmail } from "../utils/validators";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useNotifications();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(form);
      login(response.data);
      addNotification({
        title: "Login successful",
        message: "Welcome back to your workspace.",
      });
      toast.success("Welcome back");
      navigate("/app/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue to your dashboard."
      alternateLink={{
        label: "Don't have an account?",
        cta: "Create one",
        to: "/register",
      }}
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
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-sky-600 hover:text-sky-500"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
