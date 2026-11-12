import { motion } from 'motion/react'
import { useId } from 'react'
import { LAYOUT_TRANSITION } from '../lib/motion'

const VARIANTS = {
  // Gray tray with a white sliding pill (Live Alerts severity filter).
  tray: {
    wrap: 'flex rounded-lg bg-gray-100 p-0.5',
    button: 'px-3 py-2',
    pill: 'bg-white shadow-sm',
    on: 'text-ink',
    off: 'text-gray-500 hover:text-ink',
    countOn: '',
    countOff: '',
  },
  // Outlined tray with a black sliding pill (Cases status filter).
  outline: {
    wrap: 'inline-flex rounded-lg border border-gray-200 p-0.5',
    button: 'px-3 py-1.5',
    pill: 'bg-ink',
    on: 'text-white',
    off: 'text-gray-600 hover:text-ink',
    countOn: 'text-gray-300',
    countOff: 'text-gray-400',
  },
}

export default function SegmentedControl({ options, value, onChange, label, variant = 'tray' }) {
  const id = useId()
  const v = VARIANTS[variant]
  return (
    <div role="group" aria-label={label} className={v.wrap}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`relative isolate rounded-md text-[13px] font-medium transition-colors duration-150 motion-safe:active:scale-[0.98] ${v.button} ${active ? v.on : v.off}`}
          >
            {active && (
              <motion.span
                layoutId={id}
                transition={LAYOUT_TRANSITION}
                className={`absolute inset-0 -z-10 rounded-md ${v.pill}`}
              />
            )}
            <span className="flex items-center gap-1.5">
              {o.label}
              {o.count != null && (
                <span className={active ? v.countOn : v.countOff}>{o.count}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
