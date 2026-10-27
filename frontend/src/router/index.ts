import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'UserLogin',
      component: () => import('../views/auth/UserLoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login/admin',
      name: 'AdminLogin',
      component: () => import('../views/auth/AdminLoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login/user',
      redirect: '/login',
    },
    {
      path: '/reset-password/admin',
      name: 'AdminPasswordResetRequest',
      component: () => import('../views/account/PasswordResetRequestView.vue'),
      meta: { requiresAuth: false, resetRole: 'admin' },
    },
    {
      path: '/reset-password/admin/confirm',
      name: 'AdminPasswordResetConfirm',
      component: () => import('../views/account/PasswordResetConfirmView.vue'),
      meta: { requiresAuth: false, resetRole: 'admin' },
    },
    {
      path: '/reset-password/user',
      name: 'UserPasswordResetRequest',
      component: () => import('../views/account/PasswordResetRequestView.vue'),
      meta: { requiresAuth: false, resetRole: 'user' },
    },
    {
      path: '/reset-password/user/confirm',
      name: 'UserPasswordResetConfirm',
      component: () => import('../views/account/PasswordResetConfirmView.vue'),
      meta: { requiresAuth: false, resetRole: 'user' },
    },
    {
      path: '/admin',
      component: () => import('../components/layout/AppLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'AdminDashboard',
          meta: { keepAlive: true },
          component: () => import('../views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'apps',
          name: 'Apps',
          meta: { keepAlive: true },
          component: () => import('../views/admin/AppsView.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          meta: { keepAlive: true },
          component: () => import('../views/admin/UsersView.vue'),
        },
      ],
    },
    {
      path: '/user',
      component: () => import('../components/layout/AppLayout.vue'),
      meta: { requiresAuth: true, role: 'user' },
      children: [
        {
          path: '',
          name: 'UserDashboard',
          meta: { keepAlive: true },
          component: () => import('../views/user/UserDashboardView.vue'),
        },
      ],
    },
    {
      path: '/',
      name: 'Home',
      redirect: () => {
        const auth = useAuthStore()
        if (auth.isAdmin) return '/admin'
        if (auth.isUser) return '/user'
        return '/login'
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/not-found/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  if (!authStore.sessionChecked) {
    await authStore.bootstrapSession()
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const requiredRole = to.meta.role as 'admin' | 'user' | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    next(requiredRole === 'admin' ? '/login/admin' : '/login')
    return
  }

  if (
    authStore.isAuthenticated &&
    (to.name === 'AdminLogin' || to.name === 'UserLogin')
  ) {
    next(authStore.isAdmin ? '/admin' : '/user')
    return
  }

  if (requiredRole && authStore.role !== requiredRole) {
    next(authStore.isAdmin ? '/admin' : authStore.isUser ? '/user' : '/login')
    return
  }

  next()
})

export default router
