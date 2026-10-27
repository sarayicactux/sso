/** Resolve backend `Media.mediaUrl` (e.g. `/files/apps/...`) for use in <img src>. */
export function resolveMediaUrl(mediaUrl?: string | null): string | null {
  if (!mediaUrl || typeof mediaUrl !== 'string') return null
  const trimmed = mediaUrl.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
