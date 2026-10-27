export interface ApiErrorBody {
  status?: number
  statusCode?: number
  error?: string
  message?: string | string[]
}

type AxiosLikeError = {
  response?: {
    status?: number
    data?: ApiErrorBody | string
  }
}

export function getApiError(e: unknown): string | null {
  const err = e as AxiosLikeError | null
  const data = err?.response?.data
  if (!data) return null
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data !== null) {
    if (typeof data.error === 'string' && data.error) return data.error
    const msg = data.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (typeof msg === 'string') return msg
  }
  return null
}
