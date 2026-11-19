import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRightIcon, SearchIcon } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import SegmentedControl from '../components/SegmentedControl'
import SeverityBadge from '../components/SeverityBadge'
import StatCard from '../components/StatCard'
import {
  formatDetected,
  formatTime,
  getAgentsInvolved,
  getAlertById,
  getAlerts,
  getCaseById,
  getCriticalCount,
} from '../data/selectors'
import { LAYOUT_TRANSITION, fadeProps, useRowMotion } from '../lib/motion'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
]

const COLS =
  'grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_minmax(0,1.5fr)_76px_92px] items-center gap-3 px-5'

function AgentAvatar({ name }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold uppercase">
      {name[0]}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div className="grid grid-cols-[112px_1fr] items-center gap-2 py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function AlertDetail({ alert }) {
  const navigate = useNavigate()
  const relatedCase = getCaseById(alert.caseId)
  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={alert.id} {...fadeProps} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wider text-gray-500">
                ALERT · {alert.id}
              </span>
              <SeverityBadge severity={alert.severity} />
            </div>
            <h2 className="mt-4 text-xl font-bold leading-snug">{alert.title}</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <dl>
              <Field label="Agent">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[10px] font-bold uppercase text-brand">
                    {alert.agent[0]}
                  </span>
                  {alert.agent}
                </span>
              </Field>
              <Field label="File">
                <span className="block break-all font-mono text-[13px]">{alert.file}</span>
              </Field>
              <Field label="Detected">{formatDetected(alert.detectedAt)}</Field>
              <Field label="Case">
                {alert.caseId}
                {relatedCase ? ` · ${relatedCase.status}` : ''}
              </Field>
            </dl>

            <div className="mt-5 rounded-lg border border-gray-200 bg-[#FAFAF5] p-4">
              <h3 className="text-[11px] font-semibold tracking-wider text-gray-600">
                WHY IT WAS FLAGGED
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{alert.why}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 p-6">
            <button
              type="button"
              onClick={() => navigate(`/cases?id=${alert.caseId}`)}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black motion-safe:active:scale-[0.98]"
            >
              View related case
              <ArrowRightIcon className="text-brand transition-transform duration-150 ease-out motion-safe:group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  )
}

export default function LiveAlerts() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('all')
  const row = useRowMotion()

  const all = useMemo(() => getAlerts(), [])
  const selected = getAlertById(params.get('id')) ?? all[0]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter(
      (a) =>
        (severity === 'all' || a.severity === severity) &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.agent.toLowerCase().includes(q) ||
          a.file.toLowerCase().includes(q)),
    )
  }, [all, query, severity])

  const select = (id) => setParams({ id }, { replace: true })

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Live Alerts" subtitle="Suspicious agent activity from the last 24 hours." />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-8 py-6 xl:grid-cols-[62fr_38fr]">
        <div className="flex min-h-0 flex-col gap-5">
          <div className="grid shrink-0 grid-cols-3 gap-5">
            <StatCard index={0} label="Open alerts" value={all.length} />
            <StatCard index={1} label="Critical" value={getCriticalCount(all)} valueTone="critical" />
            <StatCard index={2} label="Agents involved" value={getAgentsInvolved(all)} />
          </div>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex shrink-0 flex-wrap items-center gap-3 p-4">
              <label className="relative min-w-48 flex-1">
                <span className="sr-only">Search alerts</span>
                <SearchIcon
                  width={16}
                  height={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search event, agent or file"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors duration-150 focus:border-ink focus-visible:outline-none"
                />
              </label>
              <SegmentedControl
                label="Filter by severity"
                options={FILTERS}
                value={severity}
                onChange={setSeverity}
              />
            </div>

            <div
              className={`${COLS} shrink-0 border-y border-gray-100 bg-gray-50 py-2.5 text-xs font-medium text-gray-500`}
            >
              <span>Event</span>
              <span>Agent</span>
              <span>File</span>
              <span>Time</span>
              <span>Severity</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <ul className="relative">
                <AnimatePresence mode="popLayout">
                  {visible.map((a, i) => {
                    const active = a.id === selected.id
                    return (
                      <motion.li
                        key={a.id}
                        {...row(i)}
                        className="relative isolate border-b border-gray-100"
                      >
                        <button
                          type="button"
                          onClick={() => select(a.id)}
                          aria-current={active ? 'true' : undefined}
                          className={`${COLS} w-full py-3 text-left text-sm transition-colors duration-150 focus-visible:-outline-offset-2 ${
                            active ? '' : 'hover:bg-gray-50'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="alerts-selected-row"
                              transition={LAYOUT_TRANSITION}
                              className="absolute inset-0 -z-10 bg-[#FFFCE8] shadow-[inset_3px_0_0_var(--color-brand)]"
                            />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-medium" title={a.title}>
                              {a.title}
                            </span>
                            <span className="block text-xs text-gray-500">{a.id}</span>
                          </span>
                          <span className="flex min-w-0 items-center gap-2" title={a.agent}>
                            <AgentAvatar name={a.agent} />
                            <span className="truncate">{a.agent}</span>
                          </span>
                          <span className="truncate font-mono text-xs" title={a.file}>
                            {a.file}
                          </span>
                          <span className="text-gray-600">{formatTime(a.detectedAt)}</span>
                          <span>
                            <SeverityBadge severity={a.severity} />
                          </span>
                        </button>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>

              {visible.length === 0 && (
                <motion.div {...fadeProps} className="px-5 py-16 text-center">
                  <p className="font-semibold">No alerts match your search</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try a different keyword or severity filter.
                  </p>
                </motion.div>
              )}
            </div>

            <footer className="flex shrink-0 items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
              <span>
                Showing {visible.length} of {all.length} alerts
              </span>
              <span>Updated {formatTime(all[0].detectedAt).slice(0, 5)}</span>
            </footer>
          </section>
        </div>

        <AlertDetail alert={selected} />
      </div>
    </div>
  )
}
