import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCaseEvidence, getEvidenceContent, getEvidenceList } from '../api'
import { useApi } from '../api/useApi'
import AgentChip from '../components/AgentChip'
import ErrorState from '../components/ErrorState'
import { CheckIcon, CopyIcon, DownloadIcon, FileIcon } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import { Skeleton, SkeletonRows } from '../components/Skeleton'
import {
  caseLabel,
  evidenceTag,
  formatDetected,
  formatSize,
  formatTime,
} from '../data/selectors'
import { DURATION, EASE, LAYOUT_TRANSITION, fadeProps, useRowMotion } from '../lib/motion'

function lineClass(kind, text) {
  if (kind === 'diff') {
    if (text.startsWith('+') && !text.startsWith('+++')) return 'bg-green-50 text-green-800'
    if (text.startsWith('-') && !text.startsWith('---')) return 'bg-red-50 text-red-800'
  }
  return ''
}

const NO_FILES = []

// `content` is the state of the content request: { data, error, retry }.
function FileBody({ file, content }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  const text = content.data
  const lines = text == null ? [] : text.split('\n')

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
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
            <Link to={`/cases?id=${file.case_id}`} className="font-medium underline">
              {caseLabel(file.case_id)}
            </Link>
            <span className="text-gray-500">{formatDetected(file.captured_at)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={copy}
            disabled={text == null}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-semibold transition-[background-color,transform] duration-150 ease-out hover:bg-gray-50 motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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
            disabled={text == null}
            className="flex items-center gap-2 rounded-lg bg-ink px-3.5 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-black motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
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

      <div className="max-h-[480px] min-h-0 flex-1 overflow-auto py-4 font-mono text-[13px] leading-6 xl:max-h-none">
        {text != null ? (
          <div className="w-max min-w-full">
            {lines.map((line, i) => (
              <div key={i} className={`flex ${lineClass(file.kind, line)}`}>
                <span className="w-14 shrink-0 select-none pr-4 text-right text-gray-400">
                  {i + 1}
                </span>
                <span className="whitespace-pre pr-7">{line || ' '}</span>
              </div>
            ))}
          </div>
        ) : content.error ? (
          <ErrorState what="file content" onRetry={content.retry} className="font-sans" />
        ) : (
          <div role="status" aria-label="Loading" className="space-y-3 px-7 py-2">
            {['w-2/3', 'w-5/6', 'w-1/2', 'w-3/4', 'w-2/5'].map((w) => (
              <Skeleton key={w} className={`h-4 ${w}`} />
            ))}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 px-7 py-3 text-xs text-gray-500">
        <span>
          {text != null ? `${lines.length} lines · ` : ''}
          {formatSize(file.size_bytes)}
        </span>
        {file.kind === 'diff' && <span>Green lines added · red lines removed</span>}
      </footer>
    </>
  )
}

function FilePreview({ file, content }) {
  return (
    <article className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={file.evidence_id} {...fadeProps} className="flex min-h-0 flex-1 flex-col">
          <FileBody file={file} content={content} />
        </motion.div>
      </AnimatePresence>
    </article>
  )
}

export default function Evidence() {
  const [params, setParams] = useSearchParams()
  const row = useRowMotion()
  const caseId = params.get('case')

  const { data, loading, error, retry } = useApi(
    caseId ? () => getCaseEvidence(caseId) : getEvidenceList,
    [caseId],
  )
  const visible = data ?? NO_FILES
  const requestedId = Number(params.get('id'))
  const selected = visible.find((f) => f.evidence_id === requestedId) ?? visible[0]
  const selectedId = selected?.evidence_id

  // The file body is a second request, made once a file is selected.
  const content = useApi(selectedId ? () => getEvidenceContent(selectedId) : null, [selectedId])

  const select = (id) => {
    const next = new URLSearchParams(params)
    next.set('id', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="flex min-h-full flex-col xl:h-full">
      <PageHeader title="Evidence" subtitle="Files and logs captured for each case." />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 px-8 py-6 xl:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]">
        <section className="flex max-h-[480px] min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white xl:max-h-none">
          <header className="flex shrink-0 items-center justify-between gap-3 px-5 py-4">
            <h2 className="truncate text-[15px] font-semibold">
              {caseId ? `Files for ${caseLabel(caseId)}` : 'All files'}
            </h2>
            <span className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
              {data && `${visible.length} ${visible.length === 1 ? 'file' : 'files'}`}
              {caseId && (
                <Link to="/evidence" className="font-semibold text-ink underline">
                  Show all
                </Link>
              )}
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-gray-100">
            {!data && loading && (
              <SkeletonRows count={6} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                <span className="block min-w-0 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </span>
              </SkeletonRows>
            )}
            {!data && !loading && error && <ErrorState what="evidence" onRetry={retry} />}
            <ul className="relative">
              <AnimatePresence mode="popLayout">
                {visible.map((f, i) => {
                  const active = f.evidence_id === selected.evidence_id
                  return (
                    <motion.li
                      key={f.evidence_id}
                      {...row(i)}
                      className="relative isolate border-b border-gray-100"
                    >
                      <button
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => select(f.evidence_id)}
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
                              {evidenceTag(f.kind)}
                            </span>
                            <span className="truncate">
                              {caseLabel(f.case_id)} · {formatTime(f.captured_at)}
                            </span>
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            {data && visible.length === 0 && (
              <motion.p {...fadeProps} className="px-5 py-12 text-center text-sm text-gray-500">
                No evidence files for this case.
              </motion.p>
            )}
          </div>
        </section>

        {selected ? (
          <FilePreview file={selected} content={content} />
        ) : (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500">
            {loading ? <Skeleton className="h-4 w-40" /> : 'Select a file to preview it.'}
          </div>
        )}
      </div>
    </div>
  )
}
