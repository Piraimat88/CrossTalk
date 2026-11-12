const styles = {
  critical: { wrap: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  high: { wrap: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  low: { wrap: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  normal: { wrap: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
}
const labels = { critical: 'Critical', high: 'High', low: 'Low', normal: 'Normal' }

export default function SeverityBadge({ severity, label }) {
  const s = styles[severity] ?? styles.normal
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${s.wrap}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label ?? labels[severity]}
    </span>
  )
}
