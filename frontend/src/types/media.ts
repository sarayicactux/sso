export interface MediaDto {
  id: number
  mediaUrl?: string
  mimeType?: string
  name?: string
  url?: string
  [key: string]: unknown
}
