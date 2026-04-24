import { motion } from "framer-motion";
import { BarChart3, CalendarRange, MessageSquareText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Seo from "../components/system/Seo";
import { useAuth } from "../context/useAuth";

const features = [
  {
    title: "Real-Time Communication",
    description:
      "Fast Socket.io messaging with typing indicators, groups, and collaboration-ready chat windows.",
    icon: MessageSquareText,
  },
  {
    title: "Role-Based Dashboard",
    description:
      "Admin, organizer, and user roles each get contextual actions and analytics from one secure system.",
    icon: ShieldCheck,
  },
  {
    title: "Event and Product Modules",
    description:
      "Manage events, inventory, and search/filter workflows in responsive card and list experiences.",
    icon: CalendarRange,
  },
  {
    title: "Analytics at a Glance",
    description:
      "Visualize adoption and activity trends with charts and micro-interactions designed for decision making.",
    icon: BarChart3,
  },
];

function Home() {
  const MotionDiv = motion.div;
  const MotionArticle = motion.article;
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-app-gradient">
      <Seo
        title="NexConnect | Secure Real-time Team Collaboration"
        description="Modern, responsive collaboration with real-time chat, role-based dashboards, and workflow modules."
      />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-12"
          >
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-sky-300/60 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300">
                MERN • Tailwind v4 • Framer Motion
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
                Build modern teams with a polished, responsive collaboration hub.
              </h1>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                A clean, industry-grade frontend with glassmorphism cards, role-aware
                dashboards, real-time updates, and delightful transitions.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={user ? "/app/dashboard" : "/register"}
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </Link>
                <Link
                  to={user ? "/app/chat" : "/login"}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Explore Live Chat
                </Link>
              </div>
            </div>
          </MotionDiv>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {features.map((feature, index) => (
              <MotionArticle
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true }}
                className="flex h-full flex-col rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                  <feature.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </MotionArticle>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
