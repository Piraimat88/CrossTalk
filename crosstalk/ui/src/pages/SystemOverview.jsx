import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { getOverview } from '../api'
import { useApi } from '../api/useApi'
import ErrorState from '../components/ErrorState'
import PageHeader from '../components/PageHeader'
import Panel from '../components/Panel'
import SeverityBadge from '../components/SeverityBadge'
import { Skeleton, SkeletonRows, StatCardSkeleton } from '../components/Skeleton'
import StatCard from '../components/StatCard'
import { caseLabel, formatShortTime } from '../data/selectors'
import { useItemMotion } from '../lib/motion'

const STAT_COUNT = 4

export default function SystemOverview() {
  const item = useItemMotion()
  const { data, loading, error, retry } = useApi(getOverview)
  const failed = !data && !loading && error

  // Panel content before data arrives: skeleton rows while loading, retry on error.
  const placeholder = (what, rows) =>
    failed ? (
      <ErrorState what={what} onRetry={retry} />
    ) : (
      <SkeletonRows count={rows}>
        <Skeleton className="h-4 w-3/4" />
      </SkeletonRows>
    )

  // Lists start after the stat cards in the stagger sequence.
  const after = STAT_COUNT

  return (
    <div>
      <PageHeader
        title="System Overview"
        subtitle="What needs attention across your agents right now."
      />

      <div className="space-y-5 px-8 py-6">
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {data
            ? data.stats.map((s, i) => <StatCard key={s.label} index={i} {...s} />)
            : Array.from({ length: STAT_COUNT }, (_, i) => <StatCardSkeleton key={i} still={Boolean(failed)} />)}
        </div>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="min-w-0 space-y-5">
            <Panel title="Latest alerts" to="/alerts">
              {data ? (
                <ul className="divide-y divide-gray-100">
                  {data.latestAlerts.map((a, i) => (
                    <motion.li key={a.detection_id} {...item(after + i)}>
                      <Link
                        to={`/alerts?id=${a.detection_id}`}
                        className="flex items-center px-5 py-3.5 text-sm transition-colors duration-150 hover:bg-gray-50"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium" title={a.title}>
                          {a.title}
                        </span>
                        <span
                          className="w-36 truncate text-gray-500"
                          title={a.agents.join(', ')}
                        >
                          {a.agents.join(', ')}
                        </span>
                        <span className="w-16 text-gray-500">{formatShortTime(a.detected_at)}</span>
                        <span className="w-20 text-right">
                          <SeverityBadge severity={a.severity} />
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                placeholder('alerts', 5)
              )}
            </Panel>

            <Panel title="Open cases" to="/cases">
              {data ? (
                <ul className="divide-y divide-gray-100">
                  {data.openCases.map((c, i) => (
                    <motion.li key={c.case_id} {...item(after + i)}>
                      <Link
                        to={`/cases?id=${c.case_id}`}
                        className="flex items-center gap-4 px-5 py-3.5 text-sm transition-colors duration-150 hover:bg-gray-50"
                      >
                        <span className="w-16 text-gray-500">{caseLabel(c.case_id)}</span>
                        <span className="min-w-0 flex-1 truncate font-medium" title={c.title}>
                          {c.title}
                        </span>
                        <SeverityBadge severity={c.severity} />
                        <span className="w-12 text-right text-gray-500">
                          {formatShortTime(c.created_at)}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                placeholder('cases', 3)
              )}
            </Panel>
          </div>

          <Panel
            title="Agents"
            meta={data ? `${data.agents.length} monitored` : undefined}
            footer="Status reflects alerts from the last 24 hours"
            className="xl:min-h-[640px]"
          >
            {data ? (
              <ul className="divide-y divide-gray-100">
                {data.agents.map((a, i) => (
                  <motion.li
                    key={a.agent_id}
                    {...item(after + i)}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-[13px] font-bold uppercase text-brand">
                      {a.name[0]}
                    </span>
                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="truncate text-sm font-semibold">{a.name}</div>
                      <div className="truncate text-xs text-gray-500" title={a.description}>
                        {a.description} · active {formatShortTime(a.last_seen_at)}
                      </div>
                    </div>
                    <SeverityBadge
                      severity={a.severity}
                      label={
                        a.alerts === 0
                          ? 'Normal'
                          : `${a.alerts} ${a.alerts === 1 ? 'alert' : 'alerts'}`
                      }
                    />
                  </motion.li>
                ))}
              </ul>
            ) : (
              placeholder('agents', 3)
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
