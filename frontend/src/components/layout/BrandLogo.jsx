import { MessageCircleMore } from "lucide-react";
import { Link } from "react-router-dom";

function BrandLogo({ to = "/", compact = false }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-slate-900 dark:text-slate-100"
      aria-label="Nexus Connect home"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-600/30">
        <MessageCircleMore size={20} />
      </span>
      {!compact && (
        <span className="text-base font-semibold tracking-tight">NexConnect</span>
      )}
    </Link>
  );
}

export default BrandLogo;
