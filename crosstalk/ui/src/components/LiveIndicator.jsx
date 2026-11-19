export default function LiveIndicator() {
  return (
    <span className="flex items-center gap-2 rounded-full border border-gray-200 px-3.5 py-2 text-[13px] text-ink">
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-green-500 motion-safe:animate-pulse-ring" />
        <span className="relative h-2 w-2 rounded-full bg-green-500" />
      </span>
      Monitoring live
    </span>
  )
}
