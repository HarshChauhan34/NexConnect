import { CalendarDays, Filter, MapPin, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/useAuth";
import { deleteEvent, getEvents } from "../services/eventService";

function Events() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingEventId, setDeletingEventId] = useState(null);

  const canDeleteEvent = (event) => {
    const role = user?.role;
    if (role === "admin") return true;
    if (role !== "organizer") return false;

    const createdById =
      typeof event.createdBy === "string" ? event.createdBy : event.createdBy?._id;

    return Boolean(createdById && createdById === user?._id);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setDeletingEventId(eventId);
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((item) => item._id !== eventId));
      toast.success("Event deleted");
    } catch (apiError) {
      toast.error(apiError.response?.data?.message || "Failed to delete event.");
    } finally {
      setDeletingEventId(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await getEvents({
          search: debouncedQuery,
          category,
          page,
          limit: 4,
        });

        if (isMounted) {
          setEvents(response.data.items || []);
          setTotalPages(response.data.totalPages || 1);
          setError("");
        }
      } catch (apiError) {
        if (isMounted) {
          setError(apiError.response?.data?.message || "Failed to fetch events.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, category, page]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Events Hub</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Search, filter, and manage upcoming events from MongoDB.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search by title or city..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={category}
              onChange={(event) => {
                setPage(1);
                setCategory(event.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="All">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          Loading events...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="grid gap-4 md:grid-cols-2">
          {events.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              No events found for the selected filters.
            </div>
          )}

          {events.map((event) => (
            <article
              key={event._id}
              className="flex h-full flex-col rounded-2xl border border-white/60 bg-white/80 p-5 shadow-md backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="inline-flex w-fit rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                  {event.category}
                </p>
                {canDeleteEvent(event) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event._id)}
                    disabled={deletingEventId === event._id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/20"
                    aria-label="Delete event"
                    title="Delete event"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
                {event.title}
              </h3>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p className="inline-flex items-center gap-2">
                  <MapPin size={15} /> {event.city}
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarDays size={15} /> {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={page === 1 || loading}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
        >
          Previous
        </button>
        <p className="w-full text-center text-sm text-slate-600 sm:w-auto dark:text-slate-300">
          Page {page} of {totalPages}
        </p>
        <button
          type="button"
          disabled={page === totalPages || loading}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Events;
