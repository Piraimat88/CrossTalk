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
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Keyed by path only: ?id= changes must not replay the page transition. */}
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  )
}
