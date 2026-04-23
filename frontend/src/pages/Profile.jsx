import { Camera, Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { updateProfile, uploadAvatar } from "../services/authService";
import { validateEmail } from "../utils/validators";

function Profile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      setSaving(true);
      const response = await updateProfile(form);
      login(response.data);
      toast.success("Profile updated");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await uploadAvatar(file);
      if (response.data?.user) {
        login(response.data.user);
      }
      toast.success("Avatar updated");
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Avatar upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
        <div className="relative mx-auto w-fit">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                user?.name || "User",
              )}`
            }
            alt="Profile avatar"
            className="h-28 w-28 rounded-2xl object-cover"
          />
          <label className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
            <Camera size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>

        <h1 className="mt-4 text-center text-xl font-bold text-slate-900 dark:text-slate-100">
          {user?.name}
        </h1>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {(user?.role)?.toUpperCase() || "user"}
        </p>
        {uploading && (
          <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Uploading avatar...
          </p>
        )}
      </aside>

      <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Edit Profile
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Keep your details updated for a better team experience.
        </p>

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              name="bio"
              rows={5}
              value={form.bio}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, bio: event.target.value }))
              }
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Tell people about yourself..."
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/dashboard")}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Back
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Profile;
