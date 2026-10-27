<template>
  <div class="login-container">
    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <n-h2>{{ t('account.resetConfirmTitle') }}</n-h2>
      </div>
      <n-form ref="formRef" :model="model" :rules="rules" @submit.prevent="submit">
        <n-form-item path="token" :label="t('account.recoverToken')">
          <n-input v-model:value="model.token" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
        <n-form-item path="code" :label="t('account.code')">
          <n-input-number v-model:value="model.code" :show-button="false" style="width: 100%" />
        </n-form-item>
        <n-form-item path="newPassword" :label="t('account.newPassword')">
          <n-input v-model:value="model.newPassword" type="password" show-password-on="click" />
        </n-form-item>
        <n-form-item path="confirmPassword" :label="t('account.confirmPassword')">
          <n-input v-model:value="model.confirmPassword" type="password" show-password-on="click" />
        </n-form-item>
        <n-button type="primary" block :loading="loading" attr-type="submit">
          {{ t('account.setPassword') }}
        </n-button>
        <n-button text block style="margin-top: 12px" @click="goLogin">
          {{ t('common.back') }}
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { adminsApi } from '../../api/admins'
import { usersApi } from '../../api/users'
import { getApiError } from '../../utils/error'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const message = useMessage()
const loading = ref(false)
const formRef = ref<FormInst | null>(null)
const role = computed(() => (route.meta.resetRole as 'admin' | 'user') || 'admin')
const model = reactive({
  token: '',
  code: null as number | null,
  newPassword: '',
  confirmPassword: '',
})

const rules: FormRules = {
  token: { required: true, message: () => t('fieldRequired', { field: t('account.recoverToken') }), trigger: 'blur' },
  code: { required: true, type: 'number', message: () => t('fieldRequired', { field: t('account.code') }), trigger: 'blur' },
  newPassword: { required: true, min: 6, message: () => t('validation.passwordMinLength'), trigger: 'blur' },
  confirmPassword: [
    { required: true, message: () => t('fieldRequired', { field: t('account.confirmPassword') }), trigger: 'blur' },
    {
      validator: (_: unknown, value: string) => value === model.newPassword,
      message: () => t('account.passwordMismatch'),
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  model.token = String(route.query.token || '')
})

function goLogin() {
  router.push(role.value === 'admin' ? '/login/admin' : '/login')
}

async function submit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    const payload = { code: Number(model.code), newPassword: model.newPassword }
    if (role.value === 'admin') await adminsApi.recoverPass(model.token, payload)
    else await usersApi.recoverPass(model.token, payload)
    message.success(t('common.success'))
    goLogin()
  } catch (e) {
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
  background: #1a1a2e;
  padding: 16px;
}
.login-card {
  width: 420px;
  max-width: 100%;
  padding: 12px;
}
.login-header {
  text-align: center;
  margin-bottom: 20px;
}
</style>
