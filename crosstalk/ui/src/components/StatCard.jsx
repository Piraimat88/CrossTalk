import { motion } from 'motion/react'
import { useItemMotion } from '../lib/motion'
import CountUp from './CountUp'

export default function StatCard({ label, value, note, noteTone, valueTone, index = 0 }) {
  const item = useItemMotion()
  return (
    <motion.div {...item(index)} className="rounded-xl border border-gray-200 bg-white px-[18px] py-4">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={`text-[28px] font-bold leading-none tabular-nums ${valueTone === 'critical' ? 'text-red-600' : 'text-ink'}`}
        >
          <CountUp value={value} id={label} />
        </span>
        {note && (
          <span
            className={`text-xs ${noteTone === 'critical' ? 'font-medium text-red-600' : 'text-gray-500'}`}
          >
            {note}
          </span>
        )}
      </div>
    </motion.div>
  )
}
