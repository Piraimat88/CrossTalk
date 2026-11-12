const styles = {
  Open: 'bg-ink text-white',
  Resolved: 'bg-green-50 text-green-700',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? styles.Open}`}
    >
      {status}
    </span>
  )
}
