import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import SeverityBadge from '../components/SeverityBadge'
import StatCard from '../components/StatCard'
import { agents, openCases, stats } from '../data/mockData'
import { formatShortTime, getAlerts } from '../data/selectors'
import { useItemMotion } from '../lib/motion'

const latestAlerts = getAlerts().slice(0, 5)

export default function SystemOverview() {
  const item = useItemMotion()
  // Lists start after the stat cards in the stagger sequence.
  const after = stats.length

  return (
    <div>
      <PageHeader
        title="System Overview"
        subtitle="What needs attention across your agents right now."
      />

      <div className="space-y-5 px-8 py-6">
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} index={i} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[1fr_440px]">
          <div className="space-y-5">
            <Panel title="Latest alerts" to="/alerts">
              <ul className="divide-y divide-gray-100">
                {latestAlerts.map((a, i) => (
                  <motion.li key={a.id} {...item(after + i)}>
                    <Link
                      to={`/alerts?id=${a.id}`}
                      className="flex items-center px-5 py-3.5 text-sm transition-colors duration-150 hover:bg-gray-50"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium" title={a.title}>
                        {a.title}
                      </span>
                      <span className="w-36 text-gray-500">{a.agent}</span>
                      <span className="w-16 text-gray-500">{formatShortTime(a.detectedAt)}</span>
                      <span className="w-20 text-right">
                        <SeverityBadge severity={a.severity} />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </Panel>

            <Panel title="Open cases" to="/cases">
              <ul className="divide-y divide-gray-100">
                {openCases.map((c, i) => (
                  <motion.li key={c.id} {...item(after + i)}>
                    <Link
                      to={`/cases?id=${c.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 text-sm transition-colors duration-150 hover:bg-gray-50"
                    >
                      <span className="w-16 text-gray-500">{c.id}</span>
                      <span className="min-w-0 flex-1 truncate font-medium" title={c.title}>
                        {c.title}
                      </span>
                      <SeverityBadge severity={c.severity} />
                      <span className="w-12 text-right text-gray-500">
                        {formatShortTime(c.openedAt)}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel
            title="Agents"
            meta={`${agents.length} monitored`}
            footer="Status reflects alerts from the last 24 hours"
            className="min-h-[640px]"
          >
            <ul className="divide-y divide-gray-100">
              {agents.map((a, i) => (
                <motion.li
                  key={a.name}
                  {...item(after + i)}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-[13px] font-bold uppercase text-brand">
                    {a.name[0]}
                  </span>
                  <div className="flex-1 leading-snug">
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-xs text-gray-500">
                      {a.role} · active {a.lastActive}
                    </div>
                  </div>
                  <SeverityBadge
                    severity={a.severity}
                    label={
                      a.alerts === 0 ? 'Normal' : `${a.alerts} ${a.alerts === 1 ? 'alert' : 'alerts'}`
                    }
                  />
                </motion.li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
