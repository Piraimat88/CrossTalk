// Low-level helpers for src/api. Pages never import this file; they use src/api/index.js.

// true: answer from src/data/mockData.js. false: call the API server at API_URL.
export const USE_MOCK = true

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const MIN_DELAY_MS = 300
const MAX_DELAY_MS = 700

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Open the app with ?fail=1 to make every mock call fail (to test error states).
// Read once at load too, because in-app navigation can replace the query string.
const failFromStart = new URLSearchParams(window.location.search).get('fail') === '1'
const shouldFail = () =>
  failFromStart || new URLSearchParams(window.location.search).get('fail') === '1'

// Mock call: short random delay so loading states are visible, then the result.
export async function mockCall(produce) {
  await sleep(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS))
  if (shouldFail()) throw new Error('Mock request failed (?fail=1)')
  return produce()
}

// Real call: GET {API_URL}{path}. Returns JSON, or text with { text: true }.
export async function request(path, { text = false } = {}) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`)
  return text ? res.text() : res.json()
}

// One place that picks mock or real, so each endpoint function stays one line.
export const get = (path, produce, options) =>
  USE_MOCK ? mockCall(produce) : request(path, options)
