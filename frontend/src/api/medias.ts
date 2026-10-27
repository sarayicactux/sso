import client from './client'
import type { MediaDto } from '../types/media'

export const mediasApi = {
  uploadFile(file: File, dist = 'apps') {
    const form = new FormData()
    form.append('file', file)
    form.append('dist', dist)
    return client.post<MediaDto>('/medias/uploadFile', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete(mediaId: number) {
    return client.delete<boolean>(`/medias/${mediaId}`)
  },
}
