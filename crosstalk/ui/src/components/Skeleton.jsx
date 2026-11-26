// Placeholder blocks shown while data loads (same gray, radius and spacing as the real UI).
export function Skeleton({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded bg-gray-100 ${className}`} />
}

// `still` stops the pulse (used when loading failed, so it doesn't look like it is still loading).
export function StatCardSkeleton({ still = false }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="rounded-xl border border-gray-200 bg-white px-[18px] py-4"
    >
      <Skeleton className={`h-4 w-20 ${still ? 'animate-none' : ''}`} />
      <Skeleton className={`mt-1 h-7 w-12 ${still ? 'animate-none' : ''}`} />
    </div>
  )
}

// A list of placeholder rows. `children` renders the inside of one row.
export function SkeletonRows({ count = 5, className = 'px-5 py-3.5', children }) {
  return (
    <ul role="status" aria-label="Loading" className="divide-y divide-gray-100">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={className}>
          {children}
        </li>
      ))}
    </ul>
  )
}
