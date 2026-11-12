import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { DURATION, EASE } from '../lib/motion'

// Counts up from 0 the first time a given id is shown in this session.
const played = new Set()

export default function CountUp({ value, id }) {
  const reduce = useReducedMotion()
  const [shouldAnimate] = useState(() => !reduce && !played.has(id))
  const motionValue = useMotionValue(shouldAnimate ? 0 : value)
  const rounded = useTransform(motionValue, (v) => Math.round(v))

  useEffect(() => {
    played.add(id)
    if (!shouldAnimate) {
      motionValue.set(value)
      return undefined
    }
    const controls = animate(motionValue, value, { duration: DURATION.count, ease: EASE })
    return () => controls.stop()
  }, [id, value, shouldAnimate, motionValue])

  return <motion.span>{rounded}</motion.span>
}
