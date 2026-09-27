export function personName(value) {
  if (!value) return 'Unassigned'
  if (typeof value === 'object') return value.name ?? value.email ?? value._id ?? 'Unknown'
  return String(value)
}

export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function titleCase(value) {
  if (!value) return '-'
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}