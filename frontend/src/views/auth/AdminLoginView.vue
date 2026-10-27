<template>
  <div class="login-container">
    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <n-h1>{{ t('login.adminTitle') }}</n-h1>
        <n-text depth="3">{{ t('app.title') }}</n-text>
      </div>
      <n-form ref="formRef" :model="model" :rules="rules" @submit.prevent="handleLogin">
        <n-form-item path="username" :label="t('login.username')">
          <n-input
            v-model:value="model.username"
            :input-props="{ name: 'username', autocomplete: 'username' }"
            :placeholder="t('login.username')"
          />
        </n-form-item>
        <n-form-item path="password" :label="t('login.password')">
          <n-input
            v-model:value="model.password"
            type="password"
            :input-props="{ name: 'password', autocomplete: 'current-password' }"
            show-password-on="click"
            :placeholder="t('login.password')"
          />
        </n-form-item>
        <n-button type="primary" block :loading="loading" attr-type="submit" size="large">
          {{ t('login.signIn') }}
        </n-button>
        <n-button text type="primary" block style="margin-top: 12px" @click="router.push('/reset-password/admin')">
          {{ t('login.forgotPassword') }}
        </n-button>
      </n-form>
      <div class="locale-row">
        <n-button text size="small" @click="toggleLocale">
          {{ locale === 'fa' ? 'English' : 'فارسی' }}
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { getApiError } from '../../utils/error'

const router = useRouter()
const message = useMessage()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref<FormInst | null>(null)
const model = reactive({ username: '', password: '' })

const rules: FormRules = {
  username: {
    required: true,
    message: () => t('fieldRequired', { field: t('login.username') }),
    trigger: 'blur',
  },
  password: {
    required: true,
    min: 6,
    message: () => t('validation.passwordMinLength'),
    trigger: 'blur',
  },
}

function toggleLocale() {
  locale.value = locale.value === 'fa' ? 'en' : 'fa'
  localStorage.setItem('locale', locale.value)
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await authStore.loginAdmin(model.username, model.password)
    router.push('/admin')
  } catch (e: unknown) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #0f766e 0%, #1a1a2e 55%, #111827 100%);
  padding: 16px;
}
.login-card {
  width: 400px;
  max-width: 100%;
  padding: 12px;
}
.login-header {
  text-align: center;
  margin-bottom: 24px;
}
.locale-row {
  margin-top: 16px;
  text-align: center;
}
</style>
