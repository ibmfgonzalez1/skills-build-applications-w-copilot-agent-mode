const codespaceName = import.meta.env.VITE_CODESPACE_NAME?.trim()

export const API_BASE_URL = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev/api`
  : 'http://localhost:8000/api'

export function normalizeCollection(payload) {
  const nested = payload?.data
  const candidates = [
    payload,
    payload?.results,
    payload?.entries,
    payload?.items,
    Array.isArray(nested) ? nested : null,
    nested?.results,
    nested?.items,
  ]
  const records = candidates.find(Array.isArray) ?? []
  const metadata = Array.isArray(payload) ? {} : payload ?? {}

  return {
    records,
    count: Number.isFinite(metadata.count) ? metadata.count : records.length,
    next: metadata.next ?? null,
    previous: metadata.previous ?? null,
  }
}

export async function fetchCollection(component, query = '', signal) {
  const suffix = query ? `?${query.replace(/^\?/, '')}` : ''
  const response = await fetch(`${API_BASE_URL}/${component}/${suffix}`, { signal })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return normalizeCollection(payload)
}