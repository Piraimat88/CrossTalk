import { useReducedMotion } from 'motion/react'

// Shared animation settings: fast, ease-out, restrained.
export const EASE = [0.22, 1, 0.36, 1]

export const DURATION = {
  fast: 0.15,
  base: 0.2,
  count: 0.6,
}

export const STAGGER = 0.035
export const MAX_STAGGERED_ITEMS = 8

export const BASE_TRANSITION = { duration: DURATION.base, ease: EASE }

// Sliding indicators (layoutId) and layout reflow.
export const LAYOUT_TRANSITION = { duration: DURATION.base, ease: EASE }

// Route change: content fades in with a small upward shift.
export const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: BASE_TRANSITION },
}

// Cross-fade for detail panels (use with the selected id as key).
export const fadeProps = {
  variants: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: DURATION.fast, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.1, ease: EASE } },
  },
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
}

// Cards and list rows: short staggered entrance, rows can also leave.
export const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE, delay },
  }),
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE } },
}

// Returns a function: item(index) -> props for a motion element.
// With reduced motion the stagger delay is dropped (movement is removed by MotionConfig).
export function useItemMotion() {
  const reduce = useReducedMotion()
  return (index = 0) => ({
    variants: itemVariants,
    initial: 'hidden',
    animate: 'show',
    custom: reduce ? 0 : Math.min(index, MAX_STAGGERED_ITEMS) * STAGGER,
  })
}

// Filterable list rows: staggered entrance, fade out, smooth reflow.
export function useRowMotion() {
  const item = useItemMotion()
  return (index = 0) => ({
    ...item(index),
    exit: 'exit',
    layout: 'position',
    transition: { layout: LAYOUT_TRANSITION },
  })
}
