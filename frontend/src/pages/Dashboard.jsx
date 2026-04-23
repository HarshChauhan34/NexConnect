import { motion } from "framer-motion";
import { CalendarClock, MessageCircle, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { getDashboardSummary } from "../services/dashboardService";
import { createEvent } from "../services/eventService";
import { createProduct } from "../services/productService";
import {
  getOrganizerRequests,
  requestOrganizerRole,
  reviewOrganizerRequest,
} from "../services/authService";

function Dashboard() {
  const MotionArticle = motion.article;
  const { user } = useAuth();
  const role = user?.role || "user";

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [requestingOrganizer, setRequestingOrganizer] = useState(false);
  const [organizerRequests, setOrganizerRequests] = useState([]);
  const [loadingOrganizerRequests, setLoadingOrganizerRequests] = useState(
    role === "admin",
  );
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [organizerRequestStatus, setOrganizerRequestStatus] = useState(
    user?.organizerRequestStatus || "none",
  );
  const [eventForm, setEventForm] = useState({
    title: "",
    category: "Technology",
    city: "",
    date: "",
    description: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    type: "SaaS",
    price: "",
    rating: "4.5",
    description: "",
  });

  const fetchSummary = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const response = await getDashboardSummary();
      setSummary(response.data);
      setError("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getDashboardSummary()
      .then((response) => {
        if (!isMounted) return;
        setSummary(response.data);
        setError("");
      })
      .catch((apiError) => {
        if (!isMounted) return;
        setError(
          apiError.response?.data?.message || "Failed to load dashboard data.",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (role !== "admin") return;
    let isMounted = true;
    getOrganizerRequests()
      .then((response) => {
        if (!isMounted) return;
        setOrganizerRequests(response.data || []);
      })
      .catch((apiError) => {
        if (!isMounted) return;
        toast.error(
          apiError.response?.data?.message || "Failed to load organizer requests",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingOrganizerRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  const roleMessage = useMemo(() => {
    if (role === "admin") return "You can manage platform-wide controls and analytics.";
    if (role === "organizer")
      return "You can manage schedules, products, and collaboration groups.";
    return "You can chat, discover events, and manage your profile.";
  }, [role]);

  const stats = [
    { label: "Total Users", value: summary?.stats?.totalUsers ?? 0, icon: Users },
    { label: "Messages Today", value: summary?.stats?.messagesToday ?? 0, icon: MessageCircle },
    { label: "Active Sessions", value: summary?.stats?.activeSessions ?? 0, icon: ShieldCheck },
    { label: "Events", value: summary?.stats?.upcomingEvents ?? 0, icon: CalendarClock },
    { label: "Products", value: summary?.stats?.totalProducts ?? 0, icon: ShoppingBag },
  ];

  const trend = summary?.trend || [];
  const roleDistribution = summary?.roleDistribution || [];
  const canCreateResources = role === "organizer";

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    if (!eventForm.title || !eventForm.city || !eventForm.date) {
      toast.error("Please fill title, city and date.");
      return;
    }

    try {
      setCreatingEvent(true);
      await createEvent({
        ...eventForm,
        date: new Date(eventForm.date).toISOString(),
      });
      toast.success("Event created");
      setEventForm({
        title: "",
        category: eventForm.category,
        city: "",
        date: "",
        description: "",
      });
      await fetchSummary({ silent: true });
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Failed to create event");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    if (!productForm.name || !productForm.price) {
      toast.error("Please fill name and price.");
      return;
    }

    try {
      setCreatingProduct(true);
      await createProduct({
        ...productForm,
        price: Number(productForm.price),
        rating: Number(productForm.rating),
      });
      toast.success("Product created");
      setProductForm({
        name: "",
        type: productForm.type,
        price: "",
        rating: "4.5",
        description: "",
      });
      await fetchSummary({ silent: true });
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Failed to create product");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleRequestOrganizer = async () => {
    try {
      setRequestingOrganizer(true);
      const response = await requestOrganizerRole();
      setOrganizerRequestStatus(response.data.organizerRequestStatus || "pending");
      toast.success(response.data.message || "Request submitted");
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Request failed");
    } finally {
      setRequestingOrganizer(false);
    }
  };

  const handleReviewRequest = async (targetUserId, action) => {
    try {
      setReviewingRequestId(targetUserId);
      await reviewOrganizerRequest(targetUserId, action);
      setOrganizerRequests((prev) => prev.filter((item) => item._id !== targetUserId));
      toast.success(
        action === "approve"
          ? "Organizer request approved"
          : "Organizer request rejected",
      );
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Failed to review request");
    } finally {
      setReviewingRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8">
        <p className="inline-flex rounded-full border border-sky-300/70 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/25 dark:text-sky-300">
          {role.toUpperCase()} DASHBOARD
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back, {user?.name?.split(" ")[0] || "there"}.
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{roleMessage}</p>
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          Loading dashboard data...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((card, index) => (
              <MotionArticle
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <card.icon size={20} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {card.value}
                </p>
              </MotionArticle>
            ))}
          </section>

          <section className="grid min-w-0 gap-5 lg:grid-cols-3">
            <article className="min-w-0 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Weekly Activity
              </h2>
              <div className="mt-4 h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="messagesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#94a3b822" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.date || label
                      }
                    />
                    <Area
                      type="linear"
                      dataKey="messages"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fill="url(#messagesFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="min-w-0 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Role Distribution
              </h2>
              <div className="mt-4 h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={82}
                      fill="#0284c7"
                      label
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          {role === "user" && (
            <section className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Become Organizer
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Request organizer role to get access to event and product controls.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
                  Status: {organizerRequestStatus}
                </span>
                <button
                  type="button"
                  disabled={
                    requestingOrganizer ||
                    organizerRequestStatus === "pending" ||
                    organizerRequestStatus === "approved"
                  }
                  onClick={handleRequestOrganizer}
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {requestingOrganizer ? "Submitting..." : "Request Organizer Access"}
                </button>
              </div>
            </section>
          )}

          {role === "admin" && (
            <section className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Organizer Requests
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Review organizer access requests from users.
              </p>

              {loadingOrganizerRequests ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Loading requests...
                </p>
              ) : organizerRequests.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  No pending organizer requests.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {organizerRequests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {request.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {request.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={reviewingRequestId === request._id}
                            onClick={() => handleReviewRequest(request._id, "approve")}
                            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={reviewingRequestId === request._id}
                            onClick={() => handleReviewRequest(request._id, "reject")}
                            className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {canCreateResources && (
            <section className="grid gap-5 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Create Event
                </h2>
                <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
                  <input
                    value={eventForm.title}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Event title"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={eventForm.category}
                      onChange={(event) =>
                        setEventForm((prev) => ({ ...prev, category: event.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option>Technology</option>
                      <option>Business</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                    <input
                      value={eventForm.city}
                      onChange={(event) =>
                        setEventForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <input
                    type="datetime-local"
                    value={eventForm.date}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, date: event.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <textarea
                    value={eventForm.description}
                    onChange={(event) =>
                      setEventForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={3}
                    placeholder="Description"
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={creatingEvent}
                    className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {creatingEvent ? "Creating..." : "Create Event"}
                  </button>
                </form>
              </article>

              <article className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Create Product
                </h2>
                <form onSubmit={handleCreateProduct} className="mt-4 space-y-3">
                  <input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Product name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      value={productForm.type}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, type: event.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option>SaaS</option>
                      <option>Automation</option>
                      <option>Marketing</option>
                      <option>Analytics</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, price: event.target.value }))
                      }
                      placeholder="Price"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={productForm.rating}
                      onChange={(event) =>
                        setProductForm((prev) => ({ ...prev, rating: event.target.value }))
                      }
                      placeholder="Rating"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <textarea
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Description"
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {creatingProduct ? "Creating..." : "Create Product"}
                  </button>
                </form>
              </article>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
