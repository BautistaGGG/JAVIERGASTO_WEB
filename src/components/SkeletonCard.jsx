export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand */}
        <div className="h-3 w-16 bg-gray-200 rounded-full skeleton-shimmer" />
        {/* Title */}
        <div className="h-4 w-full bg-gray-200 rounded-full mt-2 skeleton-shimmer" />
        <div className="h-4 w-3/4 bg-gray-200 rounded-full mt-1.5 skeleton-shimmer" />
        {/* Category */}
        <div className="h-3 w-24 bg-gray-200 rounded-full mt-2 skeleton-shimmer" />

        {/* Price */}
        <div className="mt-auto pt-3">
          <div className="h-7 w-28 bg-gray-200 rounded-full skeleton-shimmer" />
          <div className="h-2.5 w-20 bg-gray-200 rounded-full mt-1.5 skeleton-shimmer" />
        </div>

        {/* Buttons */}
        <div className="mt-3 space-y-2">
          <div className="h-12 w-full bg-gray-200 rounded-xl skeleton-shimmer" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 bg-gray-200 rounded-xl skeleton-shimmer" />
            <div className="h-10 flex-1 bg-gray-200 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-4 bg-gray-200 rounded skeleton-shimmer" />
            <div className="h-4 w-32 bg-gray-200 rounded skeleton-shimmer" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-4 md:p-8 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl skeleton-shimmer" />
            </div>
            <div className="p-5 md:p-8 space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded skeleton-shimmer" />
              <div className="h-8 w-3/4 bg-gray-200 rounded skeleton-shimmer" />
              <div className="h-6 w-20 bg-gray-200 rounded-full skeleton-shimmer" />
              <div className="h-10 w-36 bg-gray-200 rounded skeleton-shimmer" />
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full bg-gray-200 rounded skeleton-shimmer" />
                <div className="h-4 w-full bg-gray-200 rounded skeleton-shimmer" />
                <div className="h-4 w-2/3 bg-gray-200 rounded skeleton-shimmer" />
              </div>
              <div className="h-14 w-full bg-gray-200 rounded-xl mt-6 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
