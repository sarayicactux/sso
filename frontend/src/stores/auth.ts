import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminsApi } from '../api/admins'
import { usersApi } from '../api/users'
import type { AdminDto } from '../types/admin'
import type { UserDto } from '../types/user'

export type AuthRole = 'admin' | 'user'

const TOKEN_KEY = 'accessToken'
const ROLE_KEY = 'authRole'
const PROFILE_KEY = 'userInfo'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const role = ref<AuthRole | null>((localStorage.getItem(ROLE_KEY) as AuthRole | null) || null)
  const profile = ref<AdminDto | UserDto | null>(
    JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'),
  )
  const sessionChecked = ref(false)

  let isClearingSession = false

  const isAuthenticated = computed(() => !!accessToken.value && !!role.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isUser = computed(() => role.value === 'user')
  const fullName = computed(() => {
    if (!profile.value) return ''
    const name = `${profile.value.firstName || ''} ${profile.value.lastName || ''}`.trim()
    return name || profile.value.username || profile.value.mobile
  })

  function persist() {
    if (accessToken.value) localStorage.setItem(TOKEN_KEY, accessToken.value)
    else localStorage.removeItem(TOKEN_KEY)
    if (role.value) localStorage.setItem(ROLE_KEY, role.value)
    else localStorage.removeItem(ROLE_KEY)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile.value))
  }

  function setSession(nextRole: AuthRole, data: AdminDto | UserDto) {
    role.value = nextRole
    accessToken.value = data.access_token || accessToken.value
    profile.value = data
    persist()
  }

  async function bootstrapSession() {
    if (sessionChecked.value) return
    if (!accessToken.value || !role.value) {
      clearSession()
      sessionChecked.value = true
      return
    }
    try {
      if (role.value === 'admin') {
        const { data } = await adminsApi.dash()
        profile.value = data
      } else {
        const { data } = await usersApi.dash()
        profile.value = data
      }
      persist()
    } catch {
      clearSession()
    } finally {
      sessionChecked.value = true
    }
  }

  async function loginAdmin(username: string, password: string) {
    const { data } = await adminsApi.login({ username, password })
    setSession('admin', data)
    return data
  }

  async function loginUser(username: string, password: string) {
    const { data } = await usersApi.login({ username, password })
    setSession('user', data)
    return data
  }

  function clearSession() {
    accessToken.value = ''
    role.value = null
    profile.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(PROFILE_KEY)
  }

  function loginPathForRole(currentRole: AuthRole | null) {
    return currentRole === 'admin' ? '/login/admin' : '/login'
  }

  async function redirectToLogin() {
    const { default: router } = await import('../router')
    const path = loginPathForRole(role.value)
    clearSession()
    if (router.currentRoute.value.path !== path) {
      await router.replace(path)
    }
  }

  async function handleUnauthorized() {
    if (isClearingSession) return
    isClearingSession = true
    try {
      const loginPath = loginPathForRole(role.value)
      clearSession()
      const { default: router } = await import('../router')
      if (router.currentRoute.value.path !== loginPath) {
        await router.replace(loginPath)
      }
    } finally {
      isClearingSession = false
    }
  }

  async function logout() {
    try {
      if (role.value === 'admin' && accessToken.value) await adminsApi.logOut()
      if (role.value === 'user' && accessToken.value) await usersApi.logOut()
    } catch {
      // ignore
    }
    const loginPath = loginPathForRole(role.value)
    clearSession()
    const { default: router } = await import('../router')
    await router.replace(loginPath)
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    if (role.value === 'admin') {
      await adminsApi.updatePassword({ oldPassword, newPassword })
    } else {
      await usersApi.updatePassword({ oldPassword, newPassword })
    }
  }

  async function refreshProfile() {
    if (role.value === 'admin') {
      const { data } = await adminsApi.dash()
      profile.value = data
    } else if (role.value === 'user') {
      const { data } = await usersApi.dash()
      profile.value = data
    }
    persist()
  }

  return {
    accessToken,
    role,
    profile,
    sessionChecked,
    isAuthenticated,
    isAdmin,
    isUser,
    fullName,
    loginAdmin,
    loginUser,
    logout,
    handleUnauthorized,
    bootstrapSession,
    clearSession,
    changePassword,
    refreshProfile,
    redirectToLogin,
  }
})
