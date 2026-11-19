import { motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { BellIcon, ChatIcon, FileIcon, FolderIcon, GridIcon } from '../components/Icons'
import { navCounts } from '../data/mockData'
import { LAYOUT_TRANSITION } from '../lib/motion'

const items = [
  { to: '/', label: 'System Overview', icon: GridIcon, end: true },
  { to: '/alerts', label: 'Live Alerts', icon: BellIcon, count: navCounts.alerts, badge: true },
  { to: '/cases', label: 'Cases', icon: FolderIcon, count: navCounts.cases },
  { to: '/evidence', label: 'Evidence', icon: FileIcon },
]

export default function Sidebar() {
  return (
    <aside className="flex w-[232px] shrink-0 flex-col bg-ink text-gray-300">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-ink">
          <ChatIcon width={16} height={16} />
        </span>
        <span className="text-[17px] font-bold text-white">CrossTalk</span>
      </div>

      <div className="px-6 pb-3 pt-2 text-[11px] font-semibold tracking-widest text-gray-500">
        MONITOR
      </div>
      <nav className="flex flex-col gap-1 px-3.5">
        {items.map(({ to, label, icon: Icon, end, count, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative isolate flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive ? 'text-white' : 'hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={LAYOUT_TRANSITION}
                    className="absolute inset-0 -z-10 rounded-lg bg-white/10"
                  />
                )}
                <Icon
                  className={`transition-colors duration-150 ${isActive ? 'text-brand' : 'text-gray-400'}`}
                />
                <span className="flex-1">{label}</span>
                {count != null &&
                  (badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-ink">
                      {count}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">{count}</span>
                  ))}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 border-t border-white/10 px-6 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
          SO
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-white">Security Ops</div>
          <div className="text-xs text-gray-500">Analyst workspace</div>
        </div>
      </div>
    </aside>
  )
}
