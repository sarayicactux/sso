<template>
  <div class="user-dashboard">
    <div class="page-header">
      <h2>{{ t('dashboard.apps') }}</h2>
      <n-button @click="refresh" :loading="loading">{{ t('common.refresh') }}</n-button>
    </div>
    <n-spin :show="loading">
      <n-empty v-if="!apps.length" :description="t('dashboard.noApps')" />
      <div v-else class="apps-grid" :dir="locale === 'fa' ? 'rtl' : 'ltr'">
        <a
          v-for="app in apps"
          :key="app.id"
          class="app-card"
          :href="app.url || undefined"
          :target="app.url ? '_blank' : undefined"
          :rel="app.url ? 'noopener noreferrer' : undefined"
          :aria-disabled="!app.url"
          :class="{ disabled: !app.url }"
          @click="onAppClick($event, app)"
        >
          <div class="app-card-image-wrap">
            <img
              v-if="imageSrc(app)"
              class="app-card-image"
              :src="imageSrc(app)!"
              :alt="app.title || ''"
              loading="lazy"
            />
            <div v-else class="app-card-image-fallback">
              <n-text depth="3">{{ app.title?.charAt(0) || '?' }}</n-text>
            </div>
          </div>
          <div class="app-card-body">
            <h3 class="app-card-title">{{ app.title || '—' }}</h3>
            <div v-if="app.description" class="app-card-desc">{{ app.description }}</div>
            <div v-if="app.url" class="app-card-link">{{ app.url }}</div>
            <div v-else class="app-card-link muted">{{ t('dashboard.noAppUrl') }}</div>
          </div>
        </a>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../../stores/auth'
import { getApiError } from '../../utils/error'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import type { AppDto } from '../../types/app'
import type { UserDto } from '../../types/user'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const message = useMessage()
const loading = ref(false)
const profile = computed(() => authStore.profile as UserDto | null)
const apps = computed(() => profile.value?.apps || [])

function imageSrc(app: AppDto): string | null {
  return resolveMediaUrl(app.Media?.mediaUrl)
}

function onAppClick(event: MouseEvent, app: AppDto) {
  if (!app.url) {
    event.preventDefault()
    message.warning(t('dashboard.noAppUrl'))
  }
}

async function refresh() {
  loading.value = true
  try {
    await authStore.refreshProfile()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-dashboard {
  width: 100%;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.app-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--n-border-color);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  text-decoration: none;
  color: #1f2225;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  min-height: 100%;
}

.app-card:hover:not(.disabled) {
  border-color: #35c0a3;
  box-shadow: 0 6px 18px rgba(53, 192, 163, 0.16);
}

.app-card.disabled {
  cursor: not-allowed;
  opacity: 0.85;
}

.app-card-image-wrap {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #eef2f0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.app-card-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
}

.app-card-body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  color: #000;
  word-break: break-word;
}

.app-card-desc {
  font-size: 13px;
  color: #8a8a8a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-card-link {
  font-size: 12px;
  color: #35c0a3;
  word-break: break-all;
  direction: ltr;
  text-align: left;
  unicode-bidi: isolate;
}

.app-card-link.muted {
  color: #8a8a8a;
}

@media (max-width: 640px) {
  .apps-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
