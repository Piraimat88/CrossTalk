import { alerts, cases, evidenceFiles } from './mockData'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Newest first.
export const getAlerts = () =>
  [...alerts].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))

export const getAlertById = (id) => alerts.find((a) => a.id === id)

// Newest first.
export const getCases = () => [...cases].sort((a, b) => b.openedAt.localeCompare(a.openedAt))

export const getCaseById = (id) => cases.find((c) => c.id === id)

export const getEvidence = () =>
  [...evidenceFiles].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))

export const getEvidenceById = (id) => evidenceFiles.find((f) => f.id === id)

export const getEvidenceForCase = (caseId) => getEvidence().filter((f) => f.caseId === caseId)

export const getAgentsInvolved = (list = alerts) => new Set(list.map((a) => a.agent)).size

export const getCriticalCount = (list = alerts) =>
  list.filter((a) => a.severity === 'critical').length

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
