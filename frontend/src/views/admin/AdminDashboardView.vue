<template>
  <div>
    <div class="page-header">
      <h2>{{ t('dashboard.welcome') }}</h2>
      <n-button @click="refresh" :loading="loading">{{ t('common.refresh') }}</n-button>
    </div>
    <n-spin :show="loading">
      <n-card :title="t('dashboard.profile')">
        <n-descriptions label-placement="left" :column="1" bordered>
          <n-descriptions-item :label="t('dashboard.username')">
            {{ profile?.username }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('dashboard.mobile')">
            {{ profile?.mobile }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('dashboard.email')">
            {{ profile?.email }}
          </n-descriptions-item>
          <n-descriptions-item :label="t('common.status')">
            {{ t('dashboard.roleAdmin') }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../../stores/auth'
import { getApiError } from '../../utils/error'
import type { AdminDto } from '../../types/admin'

const { t } = useI18n()
const authStore = useAuthStore()
const message = useMessage()
const loading = ref(false)
const profile = computed(() => authStore.profile as AdminDto | null)

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
