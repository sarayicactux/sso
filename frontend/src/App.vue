<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    :dir="locale === 'fa' ? 'rtl' : 'ltr'"
  >
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <router-view />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { darkTheme, type GlobalThemeOverrides, enUS, faIR, dateEnUS, dateFaIR } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from './stores/theme'

const { locale } = useI18n()
const themeStore = useThemeStore()

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const faFont = locale.value === 'fa' ? 'Vazir, Tahoma, Arial, sans-serif' : undefined
  if (themeStore.isDark) {
    return {
      common: {
        primaryColor: '#22c55e',
        primaryColorHover: '#4ade80',
        primaryColorPressed: '#16a34a',
        primaryColorSuppl: '#22c55e',
        borderRadius: '6px',
        fontFamily: faFont,
      },
      Card: { borderRadius: '8px' },
      DataTable: { borderRadius: '8px' },
      Menu: {
        itemColorActive: '#14532d',
        itemColorActiveHover: '#166534',
        itemTextColorActive: '#4ade80',
      },
    }
  }
  return {
    common: {
      primaryColor: '#35c0a3',
      primaryColorHover: '#46d1b4',
      primaryColorPressed: '#238a76',
      primaryColorSuppl: '#35c0a3',
      bodyColor: '#f0f2f5',
      cardColor: '#ffffff',
      modalColor: '#ffffff',
      popoverColor: '#ffffff',
      tableColor: '#fafafa',
      actionColor: '#f0f2f5',
      hoverColor: '#e4f1d3',
      borderRadius: '6px',
      successColor: '#35c0a3',
      infoColor: '#e4f1d3',
      warningColor: '#f59e0b',
      errorColor: '#ef4444',
      fontFamily: faFont,
    },
    Card: { borderRadius: '8px' },
    DataTable: {
      borderRadius: '8px',
      tdColorHover: '#e4f1d3',
      thColorHover: '#e4f1d3',
    },
    Layout: {
      color: '#f0f2f5',
      siderColor: '#ffffff',
      headerColor: '#ffffff',
    },
    Menu: {
      itemColorActive: '#35c0a3',
      itemColorActiveHover: '#238a76',
      itemColorActiveCollapsed: '#35c0a3',
      itemColorActiveCollapsedHover: '#238a76',
      itemTextColorActive: '#ffffff',
      itemTextColorActiveHover: '#ffffff',
      itemTextColorActiveCollapsed: '#238a76',
      itemTextColorActiveCollapsedHover: '#1a6b54',
      itemIconColorActive: '#ffffff',
      itemIconColorActiveHover: '#ffffff',
      itemIconColorActiveCollapsed: '#238a76',
      itemIconColorActiveCollapsedHover: '#1a6b54',
      itemTextColor: '#333639',
      itemIconColor: '#333639',
    },
    Tag: {
      colorInfo: '#e4f1d3',
      textColorInfo: '#3a5a4a',
    },
    Button: {
      colorInfo: '#e4f1d3',
      textColorInfo: '#3a5a4a',
    },
    Input: {
      color: '#e4f1d3',
      colorFocus: '#ffffff',
      border: '1px solid #c0d9b0',
      borderFocus: '1px solid #35c0a3',
      borderHover: '1px solid #35c0a3',
      boxShadowFocus: '0 0 0 2px rgba(53, 192, 163, 0.2)',
      caretColor: '#35c0a3',
      placeholderColor: '#8a9a8a',
      textColor: '#333639',
    },
  }
})

const theme = computed(() => (themeStore.isDark ? darkTheme : null))
const naiveLocale = computed(() => (locale.value === 'fa' ? faIR : enUS))
const naiveDateLocale = computed(() => (locale.value === 'fa' ? dateFaIR : dateEnUS))

watch(
  locale,
  (val) => {
    document.documentElement.dir = val === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.lang = val
  },
  { immediate: true },
)

watch(
  () => themeStore.isDark,
  (val) => {
    document.documentElement.dataset.theme = val ? 'dark' : 'light'
  },
  { immediate: true },
)
</script>
