import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/useAuth";
import { registerUser } from "../services/authService";
import { validateEmail, validateStrongPassword } from "../utils/validators";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
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

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validateStrongPassword(form.password)) {
      setError(
        "Use 8+ chars with uppercase, lowercase, number, and special character.",
      );
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser(form);
      login(response.data);
      toast.success("Account created");
      navigate("/app/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start collaborating in minutes with role-based access."
      alternateLink={{
        label: "Already have an account?",
        cta: "Sign in",
        to: "/login",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Alex Johnson"
          />
        </div>

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
              placeholder="Strong password"
              autoComplete="new-password"
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
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            8+ characters with uppercase, lowercase, number, and symbol.
          </p>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
