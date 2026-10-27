<template>
  <div>
    <div class="page-header">
      <h2>{{ t('apps.title') }}</h2>
      <n-space>
        <n-button @click="load" :loading="loading">{{ t('common.refresh') }}</n-button>
        <n-button type="primary" @click="openCreate">{{ t('apps.add') }}</n-button>
      </n-space>
    </div>

    <div class="table-scroll-wrapper" :dir="locale === 'fa' ? 'rtl' : 'ltr'">
      <n-data-table
        :columns="columns"
        :data="rows"
        :loading="loading"
        :bordered="false"
        :row-key="(row: AppDto) => row.id"
      />
    </div>

    <n-modal
      v-model:show="showForm"
      preset="card"
      :title="editing ? t('apps.edit') : t('apps.add')"
      style="width: 520px; max-width: 95vw"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item :label="t('apps.fieldTitle')" path="title">
          <n-input v-model:value="form.title" />
        </n-form-item>
        <n-form-item :label="t('apps.description')" path="description">
          <n-input v-model:value="form.description" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
        </n-form-item>
        <n-form-item :label="t('apps.url')" path="url">
          <n-input v-model:value="form.url" />
        </n-form-item>
        <n-form-item :label="`${t('apps.media')} (${t('common.optional')})`">
          <n-upload
            :max="1"
            :default-upload="false"
            accept="image/*,.pdf"
            @change="onFileChange"
          >
            <n-button>{{ t('apps.media') }}</n-button>
          </n-upload>
          <n-text v-if="form.mediaId" depth="3" style="display: block; margin-top: 8px">
            {{ t('apps.mediaId') }}: {{ form.mediaId }}
          </n-text>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showForm = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="saving" @click="submitForm">
            {{ editing ? t('common.save') : t('common.create') }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showToken"
      preset="dialog"
      :title="t('apps.accessToken')"
      :positive-text="t('common.copy')"
      :negative-text="t('common.close')"
      @positive-click="copyToken"
    >
      <n-text style="word-break: break-all">{{ tokenValue }}</n-text>
    </n-modal>

    <n-modal
      v-model:show="showRegen"
      preset="dialog"
      :title="t('apps.regenerateToken')"
      :positive-text="t('common.confirm')"
      :negative-text="t('common.cancel')"
      :loading="regenLoading"
      @positive-click="confirmRegen"
    >
      {{ t('apps.regenerateConfirm', { title: regenTarget?.title || '' }) }}
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NButton,
  NSpace,
  NSwitch,
  NTooltip,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type UploadFileInfo,
} from 'naive-ui'
import { CreateOutline, KeyOutline, RefreshOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { appsApi } from '../../api/apps'
import { mediasApi } from '../../api/medias'
import type { AppDto } from '../../types/app'
import { getApiError } from '../../utils/error'

const { t, locale } = useI18n()
const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const regenLoading = ref(false)
const rows = ref<AppDto[]>([])
const showForm = ref(false)
const showToken = ref(false)
const showRegen = ref(false)
const editing = ref<AppDto | null>(null)
const regenTarget = ref<AppDto | null>(null)
const tokenValue = ref('')
const pendingFile = ref<File | null>(null)
const formRef = ref<FormInst | null>(null)
const form = reactive({
  title: '',
  description: '',
  url: '',
  mediaId: undefined as number | undefined,
})

const rules: FormRules = {
  title: { required: true, message: () => t('fieldRequired', { field: t('apps.fieldTitle') }), trigger: 'blur' },
  description: {
    required: true,
    message: () => t('fieldRequired', { field: t('apps.description') }),
    trigger: 'blur',
  },
  url: { required: true, message: () => t('fieldRequired', { field: t('apps.url') }), trigger: 'blur' },
}

function actionBtn(icon: unknown, tip: string, onClick: () => void) {
  return h(
    NTooltip,
    { trigger: 'hover' },
    {
      trigger: () =>
        h(
          NButton,
          { quaternary: true, circle: true, size: 'small', onClick },
          { icon: () => h(NIcon, null, { default: () => h(icon as object) }) },
        ),
      default: () => tip,
    },
  )
}

const columns: DataTableColumns<AppDto> = [
  { title: () => t('apps.fieldTitle'), key: 'title' },
  { title: () => t('apps.url'), key: 'url', ellipsis: { tooltip: true } },
  {
    title: () => t('common.status'),
    key: 'status',
    render: (row) =>
      h(NSwitch, {
        value: row.status,
        onUpdateValue: (v: boolean) => toggleStatus(row, v),
      }),
  },
  {
    title: () => t('apps.activeSession'),
    key: 'activeSession',
    render: (row) =>
      h(NSwitch, {
        value: row.activeSession,
        onUpdateValue: (v: boolean) => toggleSession(row, v),
      }),
  },
  {
    title: () => t('common.actions'),
    key: 'actions',
    render: (row) =>
      h(NSpace, { size: 4 }, () => [
        actionBtn(CreateOutline, t('common.edit'), () => openEdit(row)),
        actionBtn(KeyOutline, t('apps.accessToken'), () => showAccessToken(row)),
        actionBtn(RefreshOutline, t('apps.regenerateToken'), () => {
          regenTarget.value = row
          showRegen.value = true
        }),
      ]),
  },
]

async function load() {
  loading.value = true
  try {
    const { data } = await appsApi.list()
    rows.value = data || []
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.url = ''
  form.mediaId = undefined
  pendingFile.value = null
}

function openCreate() {
  editing.value = null
  resetForm()
  showForm.value = true
}

function openEdit(row: AppDto) {
  editing.value = row
  form.title = row.title
  form.description = row.description
  form.url = row.url
  form.mediaId = row.mediaId
  pendingFile.value = null
  showForm.value = true
}

function onFileChange(options: { fileList: UploadFileInfo[] }) {
  const file = options.fileList[0]?.file
  pendingFile.value = file instanceof File ? file : null
}

async function ensureMediaId() {
  if (!pendingFile.value) return form.mediaId
  const { data } = await mediasApi.uploadFile(pendingFile.value, 'apps')
  form.mediaId = data.id
  return data.id
}

async function submitForm() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const mediaId = await ensureMediaId()
    if (editing.value) {
      await appsApi.update(editing.value.id, {
        title: form.title,
        description: form.description,
        url: form.url,
        mediaId,
      })
      message.success(t('apps.updateSuccess'))
    } else {
      const { data } = await appsApi.create({
        title: form.title,
        description: form.description,
        url: form.url,
        mediaId,
      })
      message.success(t('apps.createSuccess'))
      if (data?.accessToken) {
        tokenValue.value = data.accessToken
        showToken.value = true
      }
    }
    showForm.value = false
    await load()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row: AppDto, status: boolean) {
  try {
    await appsApi.updateStatus(row.id, status)
    row.status = status
    message.success(t('common.success'))
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  }
}

async function toggleSession(row: AppDto, activeSession: boolean) {
  try {
    await appsApi.updateActiveSession(row.id, activeSession)
    row.activeSession = activeSession
    message.success(t('common.success'))
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  }
}

function showAccessToken(row: AppDto) {
  if (!row.accessToken) {
    message.error(t('common.empty'))
    return
  }
  tokenValue.value = row.accessToken
  showToken.value = true
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(tokenValue.value)
    message.success(t('apps.tokenCopied'))
  } catch {
    message.error(t('common.error'))
  }
  return true
}

async function confirmRegen() {
  if (!regenTarget.value) return false
  regenLoading.value = true
  try {
    const { data } = await appsApi.regenerateAccessToken(regenTarget.value.id)
    message.success(t('common.success'))
    showRegen.value = false
    await load()
    if (data?.accessToken) {
      tokenValue.value = data.accessToken
      showToken.value = true
    }
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
    return false
  } finally {
    regenLoading.value = false
  }
}

onMounted(load)
</script>
