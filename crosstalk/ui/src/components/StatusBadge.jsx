const styles = {
  open: 'bg-ink text-white',
  in_review: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-red-50 text-red-700',
  dismissed: 'bg-gray-100 text-gray-600',
}
const labels = { open: 'Open', in_review: 'In review', confirmed: 'Confirmed', dismissed: 'Dismissed' }

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.open}`}
    >
      {labels[status] ?? status}
    </span>
  )
}
