<template>
  <div class="login-container">
    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <n-h2>{{ t('account.resetRequestTitle') }}</n-h2>
        <n-text depth="3">{{ t('account.resetRequestHint') }}</n-text>
      </div>
      <n-form ref="formRef" :model="model" :rules="rules" @submit.prevent="submit">
        <n-form-item path="mobile" :label="t('login.mobile')">
          <n-input v-model:value="model.mobile" />
        </n-form-item>
        <n-button type="primary" block :loading="loading" attr-type="submit">
          {{ t('account.sendReset') }}
        </n-button>
        <n-button text block style="margin-top: 12px" @click="goLogin">
          {{ t('common.back') }}
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
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
const model = reactive({ mobile: '' })
const role = computed(() => (route.meta.resetRole as 'admin' | 'user') || 'admin')

const rules: FormRules = {
  mobile: { required: true, message: () => t('fieldRequired', { field: t('login.mobile') }), trigger: 'blur' },
}

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
    const { data } =
      role.value === 'admin'
        ? await adminsApi.forgetPass(model.mobile)
        : await usersApi.forgetPass(model.mobile)
    message.success(t('account.resetSent'))
    const confirmPath =
      role.value === 'admin' ? '/reset-password/admin/confirm' : '/reset-password/user/confirm'
    router.push({
      path: confirmPath,
      query: { token: data.recoverPassToken },
    })
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
  width: 400px;
  max-width: 100%;
  padding: 12px;
}
.login-header {
  text-align: center;
  margin-bottom: 20px;
}
</style>
