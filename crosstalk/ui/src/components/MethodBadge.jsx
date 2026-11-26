import { methodLabel } from '../data/selectors'

export default function MethodBadge({ method }) {
  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
      {methodLabel(method)}
    </span>
  )
}
