<template>
  <n-layout :has-sider="showSider" style="height: 100vh">
    <n-layout-sider
      v-if="showSider"
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="260"
      :collapsed="collapsed"
      show-trigger
      :trigger-style="triggerStyle"
      @collapse="collapsed = true"
      @expand="collapsed = false"
      :content-style="{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }"
      style="height: 100vh"
    >
      <div class="logo" :style="{ padding: collapsed ? '12px 8px' : '20px 20px' }">
        <div class="logo-text" :class="{ collapsed }">{{ t('app.title') }}</div>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="20"
        :options="menuOptions"
        :value="activeMenu"
        @update:value="handleMenuClick"
        style="flex: 1; overflow-y: auto"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-header bordered class="app-header">
        <n-space align="center" class="header-breadcrumb responsive-hide-sm">
          <div v-if="!showSider" class="header-brand">{{ t('app.title') }}</div>
          <n-breadcrumb v-else>
            <n-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              @click="router.push(item.path)"
            >
              {{ item.label }}
            </n-breadcrumb-item>
          </n-breadcrumb>
        </n-space>
        <n-space align="center" :size="16" class="header-actions">
          <n-tag size="small" :bordered="false" type="success">
            {{ authStore.isAdmin ? t('dashboard.roleAdmin') : t('dashboard.roleUser') }}
          </n-tag>
          <n-dropdown
            trigger="click"
            :options="userMenuOptions"
            :placement="userMenuPlacement"
            @select="handleUserMenu"
          >
            <n-tag :bordered="false" type="info" size="small" style="cursor: pointer">
              {{ authStore.fullName }}
            </n-tag>
          </n-dropdown>
        </n-space>
      </n-layout-header>
      <n-layout-content native-scrollbar class="layout-content">
        <div class="layout-content-inner" :class="{ 'user-layout': !showSider }">
          <router-view v-slot="{ Component, route: childRoute }">
            <keep-alive :max="10">
              <component :is="Component" v-if="childRoute.meta.keepAlive" :key="childRoute.name" />
            </keep-alive>
            <component :is="Component" v-if="!childRoute.meta.keepAlive" :key="$route.fullPath" />
          </router-view>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>

  <n-modal
    v-model:show="showChangePassword"
    preset="dialog"
    :title="t('profile.changePassword')"
    :positive-text="t('common.save')"
    :negative-text="t('common.cancel')"
    :loading="cpSubmitting"
    @positive-click="handleChangePassword"
  >
    <n-form ref="cpFormRef" :model="cpForm" :rules="cpRules" label-placement="left" label-width="140">
      <n-form-item :label="t('profile.currentPassword')" path="currentPassword">
        <n-input v-model:value="cpForm.currentPassword" type="password" show-password-on="click" />
      </n-form-item>
      <n-form-item :label="t('profile.newPassword')" path="newPassword">
        <n-input v-model:value="cpForm.newPassword" type="password" show-password-on="click" />
      </n-form-item>
      <n-form-item :label="t('profile.confirmNewPassword')" path="confirmNewPassword">
        <n-input v-model:value="cpForm.confirmNewPassword" type="password" show-password-on="click" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { h, ref, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NIcon, useMessage, type FormInst, type FormRules, type MenuOption } from 'naive-ui'
import {
  GridOutline,
  PeopleOutline,
  BusinessOutline,
  MoonOutline,
  SunnyOutline,
  LanguageOutline,
  LogOutOutline,
  LockClosedOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import { getApiError } from '../../utils/error'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const message = useMessage()
const collapsed = ref(window.innerWidth <= 1024)

const showSider = computed(() => authStore.isAdmin)

const showChangePassword = ref(false)
const cpSubmitting = ref(false)
const cpFormRef = ref<FormInst | null>(null)
const cpForm = reactive({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
const cpRules: FormRules = {
  currentPassword: { required: true, message: () => t('profile.currentPasswordRequired'), trigger: 'blur' },
  newPassword: { required: true, min: 6, message: () => t('validation.passwordMinLength'), trigger: 'blur' },
  confirmNewPassword: [
    { required: true, message: () => t('profile.confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (_: unknown, value: string) => value === cpForm.newPassword,
      message: () => t('profile.passwordMismatch'),
      trigger: 'blur',
    },
  ],
}

const triggerStyle = computed(() => (locale.value === 'fa' ? { left: 0, right: 'auto' } : {}))
const userMenuPlacement = computed(() => (locale.value === 'fa' ? 'bottom-start' : 'bottom-end'))

function renderIcon(icon: unknown) {
  return () => h(NIcon, null, { default: () => h(icon as object) })
}

const menuOptions = computed<MenuOption[]>(() => {
  locale.value
  if (authStore.isAdmin) {
    return [
      { label: t('nav.dashboard'), key: 'AdminDashboard', icon: renderIcon(GridOutline) },
      { label: t('nav.apps'), key: 'Apps', icon: renderIcon(BusinessOutline) },
      { label: t('nav.users'), key: 'Users', icon: renderIcon(PeopleOutline) },
    ]
  }
  return []
})

const activeMenu = computed(() => route.name as string)

const breadcrumbs = computed(() => {
  const home = { path: '/admin', label: t('nav.dashboard') }
  const items = [home]
  if (route.name === 'Apps') items.push({ path: '/admin/apps', label: t('nav.apps') })
  if (route.name === 'Users') items.push({ path: '/admin/users', label: t('nav.users') })
  return items
})

function handleMenuClick(key: string) {
  router.push({ name: key })
}

const userMenuOptions = computed(() => {
  locale.value
  return [
    { label: t('userMenu.changePassword'), key: 'password', icon: renderIcon(LockClosedOutline) },
    {
      label: t('userMenu.theme'),
      key: 'theme',
      icon: renderIcon(themeStore.isDark ? SunnyOutline : MoonOutline),
    },
    { label: t('userMenu.language'), key: 'lang', icon: renderIcon(LanguageOutline) },
    { label: t('userMenu.logout'), key: 'logout', icon: renderIcon(LogOutOutline) },
  ]
})

function handleUserMenu(key: string) {
  if (key === 'password') showChangePassword.value = true
  if (key === 'theme') themeStore.toggle()
  if (key === 'lang') {
    locale.value = locale.value === 'fa' ? 'en' : 'fa'
    localStorage.setItem('locale', locale.value)
  }
  if (key === 'logout') authStore.logout()
}

async function handleChangePassword() {
  try {
    await cpFormRef.value?.validate()
  } catch {
    return false
  }
  cpSubmitting.value = true
  try {
    await authStore.changePassword(cpForm.currentPassword, cpForm.newPassword)
    message.success(t('common.success'))
    showChangePassword.value = false
    cpForm.currentPassword = ''
    cpForm.newPassword = ''
    cpForm.confirmNewPassword = ''
    await authStore.logout()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
    return false
  } finally {
    cpSubmitting.value = false
  }
}
</script>

<style scoped>
.logo {
  border-bottom: 1px solid var(--n-border-color);
}
.logo-text {
  font-weight: 700;
  font-size: 18px;
  color: #35c0a3;
  white-space: nowrap;
  overflow: hidden;
}
.logo-text.collapsed {
  font-size: 12px;
  text-align: center;
}
.header-brand {
  font-weight: 700;
  font-size: 16px;
  color: #35c0a3;
}
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.layout-content {
  padding: 16px;
  background: transparent;
}
.layout-content-inner {
  max-width: 1400px;
  margin: 0 auto;
}
.layout-content-inner.user-layout {
  max-width: 960px;
}
</style>
