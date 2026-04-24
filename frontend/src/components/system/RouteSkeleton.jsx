function RouteSkeleton() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60" />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60" />
          <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60" />
          <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60" />
        </div>
      </div>
    </div>
  );
}

export default RouteSkeleton;

