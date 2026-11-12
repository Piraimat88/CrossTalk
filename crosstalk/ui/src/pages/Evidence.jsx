import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AgentChip from '../components/AgentChip'
import { CheckIcon, CopyIcon, DownloadIcon, FileIcon } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import { formatDetected, formatTime, getEvidence, getEvidenceById } from '../data/selectors'
import { DURATION, EASE, LAYOUT_TRANSITION, fadeProps, useRowMotion } from '../lib/motion'

function lineClass(type, text, highlighted) {
  if (type === 'DIFF') {
    if (text.startsWith('+') && !text.startsWith('+++')) return 'bg-green-50 text-green-800'
    if (text.startsWith('-') && !text.startsWith('---')) return 'bg-red-50 text-red-800'
  }
  return highlighted ? 'bg-[#FFFCE8]' : ''
}

function FileBody({ file }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  const lines = file.content.split('\n')

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.content)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([file.content], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex shrink-0 items-start justify-between gap-4 px-7 py-5">
        <div className="min-w-0">
          <h2 className="truncate font-mono text-xl font-bold" title={file.name}>
            {file.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <AgentChip name={file.agent} />
            <Link to={`/cases?id=${file.caseId}`} className="font-medium underline">
              {file.caseId}
            </Link>
            <span className="text-gray-500">{formatDetected(file.capturedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-semibold transition-[background-color,transform] duration-150 ease-out hover:bg-gray-50 motion-safe:active:scale-[0.98]"
          >
            <span className="relative flex h-[15px] w-[15px] items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? 'check' : 'copy'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DURATION.fast / 1.5, ease: EASE }}
                  className="flex"
                >
                  {copied ? <CheckIcon className="text-green-600" /> : <CopyIcon />}
                </motion.span>
              </AnimatePresence>
            </span>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-2 rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black motion-safe:active:scale-[0.98]"
          >
            <DownloadIcon className="text-brand" /> Download
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-y border-gray-100 bg-gray-50 px-7 py-2.5 text-xs">
        <span className="text-gray-500">Path</span>
        <span className="min-w-0 flex-1 truncate font-mono" title={file.path}>
          {file.path}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto py-4 font-mono text-[13px] leading-6">
        <div className="w-max min-w-full">
          {lines.map((text, i) => (
            <div
              key={i}
              className={`flex ${lineClass(file.type, text, file.highlight.includes(i + 1))}`}
            >
              <span className="w-14 shrink-0 select-none pr-4 text-right text-gray-400">{i + 1}</span>
              <span className="whitespace-pre pr-7">{text || ' '}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 px-7 py-3 text-xs text-gray-500">
        <span>
          {lines.length} lines · {file.size}
        </span>
        {file.type === 'DIFF' ? (
          <span>Green lines added · red lines removed</span>
        ) : (
          file.highlight.length > 0 && (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm bg-brand" />
              Highlighted lines are linked to the alert
            </span>
          )
        )}
      </footer>
    </>
  )
}

function FilePreview({ file }) {
  return (
    <article className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={file.id} {...fadeProps} className="flex min-h-0 flex-1 flex-col">
          <FileBody file={file} />
        </motion.div>
      </AnimatePresence>
    </article>
  )
}

export default function Evidence() {
  const [params, setParams] = useSearchParams()
  const row = useRowMotion()
  const caseId = params.get('case')

  const all = getEvidence()
  const visible = caseId ? all.filter((f) => f.caseId === caseId) : all
  const requested = getEvidenceById(params.get('id'))
  const selected = visible.find((f) => f.id === requested?.id) ?? visible[0]

  const select = (id) => {
    const next = new URLSearchParams(params)
    next.set('id', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Evidence" subtitle="Files and logs captured for each case." />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 px-8 py-6 lg:grid-cols-[35fr_65fr]">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <header className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
            <h2 className="truncate text-[15px] font-semibold">
              {caseId ? `Files for ${caseId}` : 'All files'}
            </h2>
            <span className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
              {visible.length} {visible.length === 1 ? 'file' : 'files'}
              {caseId && (
                <Link to="/evidence" className="font-semibold text-ink underline">
                  Show all
                </Link>
              )}
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-gray-100">
            <ul className="relative">
              <AnimatePresence mode="popLayout">
                {visible.map((f, i) => {
                  const active = f.id === selected.id
                  return (
                    <motion.li
                      key={f.id}
                      {...row(i)}
                      className="relative isolate border-b border-gray-100"
                    >
                      <button
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => select(f.id)}
                        className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 focus-visible:-outline-offset-2 ${
                          active ? '' : 'hover:bg-gray-50'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="evidence-selected-row"
                            transition={LAYOUT_TRANSITION}
                            className="absolute inset-0 -z-10 bg-[#FFFCE8] shadow-[inset_3px_0_0_var(--color-brand)]"
                          />
                        )}
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                            active ? 'bg-ink text-brand' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <FileIcon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block truncate font-mono text-[13px] font-semibold"
                            title={f.name}
                          >
                            {f.name}
                          </span>
                          <span className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-700">
                              {f.type}
                            </span>
                            <span className="truncate">
                              {f.caseId} · {formatTime(f.capturedAt)}
                            </span>
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            {visible.length === 0 && (
              <motion.p {...fadeProps} className="px-5 py-12 text-center text-sm text-gray-500">
                No evidence files for this case.
              </motion.p>
            )}
          </div>
        </section>

        {selected ? (
          <FilePreview file={selected} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500">
            Select a file to preview it.
          </div>
        )}
      </div>
    </div>
  )
}
