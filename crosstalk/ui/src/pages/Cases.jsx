import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AgentChip from '../components/AgentChip'
import { ArrowRightIcon } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import SegmentedControl from '../components/SegmentedControl'
import SeverityBadge from '../components/SeverityBadge'
import StatusBadge from '../components/StatusBadge'
import {
  formatOpened,
  formatShortTime,
  getCaseById,
  getCases,
  getEvidenceForCase,
} from '../data/selectors'
import { LAYOUT_TRANSITION, fadeProps, useRowMotion } from '../lib/motion'

function CaseDetail({ item }) {
  const navigate = useNavigate()
  const evidenceCount = getEvidenceForCase(item.id).length
  const timeline = item.timeline.slice(0, 4)

  return (
    <article className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={item.id} {...fadeProps} className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-gray-100 px-7 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium tracking-wider text-gray-500">
                CASE · {item.id}
              </span>
              <SeverityBadge severity={item.severity} />
              <StatusBadge status={item.status} />
            </div>
            <h2 className="mt-3 text-2xl font-bold leading-snug">{item.title}</h2>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Involved agents</div>
                <div className="mt-2 flex flex-col items-start gap-2">
                  {item.agents.map((name) => (
                    <AgentChip key={name} name={name} />
                  ))}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Related file</div>
                <div className="mt-2 break-all font-mono text-[13px]" title={item.file}>
                  {item.file}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Opened</div>
                <div className="mt-2 text-sm">{formatOpened(item.openedAt)}</div>
              </div>
            </div>

            <div className="mt-6 min-w-0 rounded-lg border border-gray-200 bg-[#FAFAF5] p-4">
              <h3 className="text-[11px] font-semibold tracking-wider text-gray-600">
                DETECTION REASON
              </h3>
              <p className="mt-2 break-words text-sm leading-relaxed text-gray-700">{item.reason}</p>
            </div>

            <h3 className="mt-7 text-[11px] font-semibold tracking-wider text-gray-600">TIMELINE</h3>
            <ol className="mt-3">
              {timeline.map((e, i) => {
                const last = i === timeline.length - 1
                return (
                  <li key={`${e.time}-${e.title}`} className="grid grid-cols-[56px_24px_1fr] gap-x-2">
                    <span className="pt-0.5 text-[13px] text-gray-500">{e.time}</span>
                    <span className="relative flex justify-center">
                      <span
                        className={`z-10 mt-1.5 h-2.5 w-2.5 rounded-full border ${
                          last ? 'border-brand bg-brand' : 'border-gray-300 bg-white'
                        }`}
                      />
                      {!last && <span className="absolute bottom-0 top-4 w-px bg-gray-200" />}
                    </span>
                    <span className="min-w-0 pb-4">
                      <span className="block text-sm font-semibold">{e.title}</span>
                      <span className="block text-[13px] text-gray-500">{e.agent}</span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 px-7 py-4">
            <span className="text-[13px] text-gray-500">
              {evidenceCount === 0
                ? 'No evidence files attached'
                : `${evidenceCount} evidence ${evidenceCount === 1 ? 'file' : 'files'} attached`}
            </span>
            <button
              type="button"
              disabled={evidenceCount === 0}
              onClick={() => navigate(`/evidence?case=${item.id}`)}
              className="group flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:active:scale-100"
            >
              View evidence
              <ArrowRightIcon className="text-brand transition-transform duration-150 ease-out motion-safe:group-enabled:group-hover:translate-x-1" />
            </button>
          </footer>
        </motion.div>
      </AnimatePresence>
    </article>
  )
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'Resolved', label: 'Resolved' },
]

export default function Cases() {
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const row = useRowMotion()

  const all = useMemo(() => getCases(), [])
  const options = FILTERS.map((f) => ({
    ...f,
    count: f.value === 'all' ? all.length : all.filter((c) => c.status === f.value).length,
  }))
  const visible = filter === 'all' ? all : all.filter((c) => c.status === filter)
  const selected =
    getCaseById(params.get('id')) ?? all.find((c) => c.status === 'Open') ?? all[0]

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Cases" subtitle="Investigations grouped from related alerts." />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-[35fr_65fr]">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="shrink-0 border-b border-gray-100 p-4">
            <SegmentedControl
              variant="outline"
              label="Filter cases by status"
              options={options}
              value={filter}
              onChange={setFilter}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <ul className="relative">
              <AnimatePresence mode="popLayout">
                {visible.map((c, i) => {
                  const active = c.id === selected.id
                  return (
                    <motion.li
                      key={c.id}
                      {...row(i)}
                      className="relative isolate border-b border-gray-100"
                    >
                      <button
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => setParams({ id: c.id }, { replace: true })}
                        className={`block w-full px-5 py-4 text-left transition-colors duration-150 focus-visible:-outline-offset-2 ${
                          active ? '' : 'hover:bg-gray-50'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="cases-selected-row"
                            transition={LAYOUT_TRANSITION}
                            className="absolute inset-0 -z-10 bg-[#FFFCE8] shadow-[inset_3px_0_0_var(--color-brand)]"
                          />
                        )}
                        <span className="flex items-center justify-between text-xs text-gray-500">
                          <span>{c.id}</span>
                          <span>{formatShortTime(c.openedAt)}</span>
                        </span>
                        <span className="mt-1.5 block truncate text-sm font-semibold" title={c.title}>
                          {c.title}
                        </span>
                        <span className="mt-2 flex items-center gap-2">
                          <SeverityBadge severity={c.severity} />
                          <StatusBadge status={c.status} />
                        </span>
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            {visible.length === 0 && (
              <motion.p {...fadeProps} className="px-5 py-12 text-center text-sm text-gray-500">
                No cases in this view.
              </motion.p>
            )}
          </div>
        </section>

        <CaseDetail item={selected} />
      </div>
    </div>
  )
}
