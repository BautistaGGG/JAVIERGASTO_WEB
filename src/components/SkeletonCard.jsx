export default function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand */}
        <div className="h-3 w-16 bg-zinc-800 rounded-full skeleton-shimmer" />
        {/* Title */}
        <div className="h-4 w-full bg-zinc-800 rounded-full mt-2 skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded-full mt-1.5 skeleton-shimmer" />
        {/* Category */}
        <div className="h-3 w-24 bg-zinc-800 rounded-full mt-2 skeleton-shimmer" />

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="h-7 w-28 bg-zinc-800 rounded-full skeleton-shimmer" />
          <div className="h-2.5 w-20 bg-zinc-800 rounded-full mt-1.5 skeleton-shimmer" />
        </div>

        {/* Buttons */}
        <div className="mt-3 space-y-2">
          <div className="h-12 w-full bg-zinc-800 rounded-xl skeleton-shimmer" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-zinc-800 rounded-xl skeleton-shimmer" />
            <div className="h-10 flex-1 bg-zinc-800 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCatalog({ count = 6 }) {
  return (
    <div>
      <div className="h-14 rounded-xl border border-zinc-800 bg-zinc-900 mb-5 relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={`catalog-skeleton-${i}`} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-zinc-800 rounded skeleton-shimmer" />
            <div className="h-4 w-4 bg-zinc-800 rounded skeleton-shimmer" />
            <div className="h-4 w-32 bg-zinc-800 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-4 md:p-8 bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800">
              <div className="aspect-[4/3] bg-zinc-800 rounded-xl skeleton-shimmer" />
            </div>
            <div className="p-5 md:p-8 space-y-4">
              <div className="h-4 w-24 bg-zinc-800 rounded skeleton-shimmer" />
              <div className="h-8 w-3/4 bg-zinc-800 rounded skeleton-shimmer" />
              <div className="h-6 w-20 bg-zinc-800 rounded-full skeleton-shimmer" />
              <div className="h-10 w-36 bg-zinc-800 rounded skeleton-shimmer" />
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full bg-zinc-800 rounded skeleton-shimmer" />
                <div className="h-4 w-full bg-zinc-800 rounded skeleton-shimmer" />
                <div className="h-4 w-2/3 bg-zinc-800 rounded skeleton-shimmer" />
              </div>
              <div className="h-14 w-full bg-zinc-800 rounded-xl mt-6 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
