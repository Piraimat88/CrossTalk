import { MotionConfig, motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { pageVariants } from '../lib/motion'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { pathname } = useLocation()
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen overflow-hidden bg-white font-sans text-ink">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-hidden bg-gray-50">
          {/* Keyed by path only: ?id= changes must not replay the page transition. */}
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            // The page scrolls inside this box (only when stacked on narrow windows). It is the
            // animated element itself, so the y-offset moves it without adding overflow to <main>.
            className="h-full overflow-y-auto [scrollbar-gutter:auto]"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  )
}
