import {
  access_events,
  agents,
  case_agents,
  cases,
  detection_events,
  detections,
  evidence,
} from './mockData'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// The mock data is a snapshot of this day; "today" in the stats means this day.
const MOCK_TODAY = '2026-11-11'

const OPEN_STATUSES = ['open', 'in_review']
const SEVERITY_RANK = { critical: 3, high: 2, low: 1 }

const fileName = (path) => path.split('/').pop()
const byNewest = (field) => (a, b) => b[field].localeCompare(a[field])

// ---------- Labels ----------

export const alertLabel = (id) => `AL-${id}`
export const caseLabel = (id) => `CT-${id}`

const ACTION_VERBS = {
  read: 'Read',
  write: 'Wrote',
  create: 'Created',
  rename: 'Renamed',
  delete: 'Deleted',
}

// Shared labels. Every page takes method and role labels from here.
export const METHOD_LABELS = {
  provenance: 'Cross-agent read',
  decoy_access: 'Decoy touched',
  message_filename: 'Hidden message',
}
export const ROLE_LABELS = { writer: 'Wrote', reader: 'Read', accessor: 'Accessed' }
export const methodLabel = (method) => METHOD_LABELS[method] ?? method
export const roleLabel = (role) => ROLE_LABELS[role] ?? role

// writer -> reader -> accessor, so provenance reads "writer -> reader".
const ROLE_ORDER = ['writer', 'reader', 'accessor']

const EVIDENCE_TAGS = { event_log: 'LOG', file_copy: 'FILE', diff: 'DIFF', manifest: 'JSON' }
export const evidenceTag = (kind) => EVIDENCE_TAGS[kind] ?? kind

function alertTitle(method, file) {
  const name = fileName(file)
  if (method === 'provenance') return `Cross-agent read of ${name}`
  if (method === 'decoy_access') return `Decoy touched: ${name}`
  return `Hidden message in ${name}`
}

// ---------- Joins ----------

const agentById = (id) => agents.find((a) => a.agent_id === id)

// detection -> detection_events -> access_events (oldest first)
const eventsForDetection = (detectionId) =>
  detection_events
    .filter((de) => de.detection_id === detectionId)
    .map((de) => access_events.find((e) => e.event_id === de.event_id))
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))

// case -> case_agents -> agents, with the role of each agent
const agentsForCase = (caseId) =>
  case_agents
    .filter((ca) => ca.case_id === caseId)
    .map((ca) => ({ ...agentById(ca.agent_id), role: ca.role }))
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role))

function buildAlert(d) {
  const events = eventsForDetection(d.detection_id)
  const names = [...new Set(events.map((e) => agentById(e.agent_id).name))]
  const file = events[0].path_at_event
  const relatedCase = cases.find((c) => c.case_id === d.case_id)
  return {
    ...d,
    title: alertTitle(d.method, file),
    agents: names,
    // case_agents of the linked case, limited to the agents of this detection's events
    roles: agentsForCase(d.case_id).filter((a) => names.includes(a.name)),
    file,
    severity: relatedCase.severity,
    case: relatedCase,
    summary: d.details.summary,
  }
}

function buildCase(c) {
  const caseDetections = detections.filter((d) => d.case_id === c.case_id)
  const events = caseDetections
    .flatMap((d) => eventsForDetection(d.detection_id))
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
  const timeline = events.slice(0, 4).map((e) => ({
    event_id: e.event_id,
    time: e.occurred_at.slice(11, 16),
    title: `${ACTION_VERBS[e.action]} ${fileName(e.path_at_event)}`,
    agent: agentById(e.agent_id).name,
  }))
  return {
    ...c,
    agents: agentsForCase(c.case_id),
    methods: [...new Set(caseDetections.map((d) => d.method))],
    evidence_count: evidence.filter((e) => e.case_id === c.case_id).length,
    file: events[0]?.path_at_event ?? '',
    reason: caseDetections.map((d) => d.details.summary).join(' '),
    timeline,
  }
}

function buildEvidence(ev) {
  const source = access_events.find((e) => e.event_id === ev.source_event_id)
  return {
    ...ev,
    name: fileName(ev.path),
    agent: source ? agentById(source.agent_id).name : '',
  }
}

// ---------- Alerts (detections) ----------

// Newest first.
export const getAlerts = () => detections.map(buildAlert).sort(byNewest('detected_at'))

export const getAlertById = (id) => getAlerts().find((a) => a.detection_id === Number(id))

// Detections whose case has not been dismissed.
export const getOpenAlerts = () => getAlerts().filter((a) => a.case.status !== 'dismissed')

export const getAgentsInvolved = (list = getAlerts()) => new Set(list.flatMap((a) => a.agents)).size

export const getCriticalCount = (list = getAlerts()) =>
  list.filter((a) => a.severity === 'critical').length

// ---------- Cases ----------

// Newest first.
export const getCases = () => cases.map(buildCase).sort(byNewest('created_at'))

export const getCaseById = (id) => getCases().find((c) => c.case_id === Number(id))

export const isCaseOpen = (c) => OPEN_STATUSES.includes(c.status)

export const getOpenCases = () => getCases().filter(isCaseOpen)

// ---------- Evidence ----------

// Newest first.
export const getEvidence = () => evidence.map(buildEvidence).sort(byNewest('captured_at'))

export const getEvidenceById = (id) => getEvidence().find((f) => f.evidence_id === Number(id))

export const getEvidenceForCase = (caseId) =>
  getEvidence().filter((f) => f.case_id === Number(caseId))

// ---------- System overview ----------

export function getStats() {
  const open = getOpenAlerts()
  const critical = getCriticalCount(open)
  const openCases = getOpenCases()
  const resolvedToday = cases.filter(
    (c) => !OPEN_STATUSES.includes(c.status) && c.resolved_at?.startsWith(MOCK_TODAY),
  ).length
  const withAlerts = getAgentsInvolved(open)
  const caseCount = new Set(evidence.map((e) => e.case_id)).size

  return [
    {
      label: 'Open alerts',
      value: open.length,
      note: `${critical} critical`,
      noteTone: critical > 0 ? 'critical' : undefined,
    },
    { label: 'Open cases', value: openCases.length, note: `${resolvedToday} resolved today` },
    { label: 'Agents monitored', value: agents.length, note: `${withAlerts} with alerts` },
    { label: 'Evidence files', value: evidence.length, note: `across ${caseCount} cases` },
  ]
}

export const getNavCounts = () => ({ alerts: getOpenAlerts().length, cases: getOpenCases().length })

// Each agent with its open alert count and the worst severity among them.
export function getAgentSummaries() {
  const open = getOpenAlerts()
  return agents.map((a) => {
    const mine = open.filter((al) => al.agents.includes(a.name))
    const worst = mine.reduce(
      (best, al) => (SEVERITY_RANK[al.severity] > (SEVERITY_RANK[best] ?? 0) ? al.severity : best),
      'normal',
    )
    return { ...a, alerts: mine.length, severity: worst }
  })
}

// ---------- Formatting ----------

// 'YYYY-MM-DDTHH:MM:SS' -> 'HH:MM:SS'
export const formatTime = (iso) => iso.slice(11, 19)

// 'YYYY-MM-DDTHH:MM:SS' -> 'HH:MM'
export const formatShortTime = (iso) => iso.slice(11, 16)

const formatDate = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

// -> 'Nov 11, 2026 · 23:04:12'
export const formatDetected = (iso) => `${formatDate(iso)} · ${formatTime(iso)}`

// -> 'Nov 11, 2026 · 23:04'
export const formatOpened = (iso) => `${formatDate(iso)} · ${formatShortTime(iso)}`

// 612 -> '612 B', 2140 -> '2.1 KB'
export const formatSize = (bytes) =>
  bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
