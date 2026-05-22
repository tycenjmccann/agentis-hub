export function PreferencesSkeleton() {
  return (
    <div className="rounded-xl bg-surface-2 divide-y divide-surface-3" aria-busy="true" aria-label="Loading preferences">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-surface-3 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 rounded bg-surface-3 animate-pulse" />
            <div className="h-3 w-40 rounded bg-surface-3 animate-pulse" />
          </div>
          <div className="h-6 w-11 rounded-full bg-surface-3 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
