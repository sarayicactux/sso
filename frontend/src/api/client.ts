import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

client.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Accept-Language'] = localStorage.getItem('locale') || 'fa'
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const url = String(error.config?.url || '')
    // Backend uses 403 for both auth failures and business rules (e.g. bad password).
    // Public user create/revoke and password flows use 403 for domain failures.
    const businessForbidden =
      url.includes('/login') ||
      url.includes('/forgetPass') ||
      url.includes('/recoverPass') ||
      url.includes('/updatePassword') ||
      /\/users(\/apps)?$/.test(url.split('?')[0] || '')

    if (status === 401 || (status === 403 && !businessForbidden)) {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        await authStore.handleUnauthorized()
      }
    }
    return Promise.reject(error)
  },
)

export default client
