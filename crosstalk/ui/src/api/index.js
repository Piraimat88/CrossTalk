// The only data source for pages. Each function matches a future API endpoint and
// returns the already-joined object a page needs. In Sprint 4 only client.js changes.
import {
  getAgentSummaries,
  getAlertById,
  getAlerts as selectAlerts,
  getCaseById,
  getCases as selectCases,
  getEvidence as selectEvidence,
  getEvidenceById,
  getEvidenceForCase,
  getNavCounts,
  getOpenAlerts,
  getOpenCases,
  getStats,
} from '../data/selectors'
import { get } from './client'

function found(item, what) {
  if (!item) throw new Error(`${what} not found`)
  return item
}

// Evidence lists carry metadata only; the file body comes from getEvidenceContent.
const withoutContent = ({ content: _content, ...meta }) => meta // eslint-disable-line no-unused-vars

// GET /api/overview
export const getOverview = () =>
  get('/api/overview', () => ({
    stats: getStats(),
    navCounts: getNavCounts(),
    latestAlerts: selectAlerts().slice(0, 5),
    openCases: getOpenCases(),
    agents: getAgentSummaries(),
    openAlertCount: getOpenAlerts().length,
  }))

// GET /api/agents
export const getAgents = () => get('/api/agents', () => getAgentSummaries())

// GET /api/alerts: newest first, each with agents, roles, file, method, score, case.
export const getAlerts = () => get('/api/alerts', () => selectAlerts())

// GET /api/alerts/{id}
export const getAlert = (id) =>
  get(`/api/alerts/${id}`, () => found(getAlertById(id), 'Alert'))

// GET /api/cases: newest first, each with agents + roles, timeline, evidence_count.
export const getCases = () => get('/api/cases', () => selectCases())

// GET /api/cases/{id}
export const getCase = (id) => get(`/api/cases/${id}`, () => found(getCaseById(id), 'Case'))

// GET /api/cases/{id}/evidence
export const getCaseEvidence = (caseId) =>
  get(`/api/cases/${caseId}/evidence`, () => getEvidenceForCase(caseId).map(withoutContent))

// GET /api/evidence
export const getEvidenceList = () =>
  get('/api/evidence', () => selectEvidence().map(withoutContent))

// GET /api/evidence/{id}/content: the file text.
export const getEvidenceContent = (id) =>
  get(`/api/evidence/${id}/content`, () => found(getEvidenceById(id), 'Evidence').content, {
    text: true,
  })
