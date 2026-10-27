<template>
  <div class="wrap">
    <n-result status="404" :title="t('notFound.title')">
      <template #footer>
        <n-button type="primary" @click="goHome">{{ t('notFound.back') }}</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

function goHome() {
  if (authStore.isAdmin) router.push('/admin')
  else if (authStore.isUser) router.push('/user')
  else router.push('/login')
}
</script>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
