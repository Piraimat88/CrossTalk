export default function AgentChip({ name }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-[13px] font-semibold"
      title={name}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-ink text-[9px] font-bold uppercase text-brand">
        {name[0]}
      </span>
      <span className="truncate">{name}</span>
    </span>
  )
}
