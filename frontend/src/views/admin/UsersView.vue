<template>
  <div>
    <div class="page-header">
      <h2>{{ t('users.title') }}</h2>
      <n-space>
        <n-button @click="load" :loading="loading">{{ t('common.refresh') }}</n-button>
        <n-button type="primary" @click="openCreate">{{ t('users.add') }}</n-button>
      </n-space>
    </div>

    <div class="table-scroll-wrapper" :dir="locale === 'fa' ? 'rtl' : 'ltr'">
      <n-data-table
        :columns="columns"
        :data="rows"
        :loading="loading"
        :bordered="false"
        :row-key="(row: UserDto) => row.id"
      />
      <n-empty v-if="!loading && !rows.length" :description="t('common.empty')" style="margin-top: 24px" />
    </div>

    <n-modal
      v-model:show="showCreate"
      preset="card"
      :title="t('users.add')"
      style="width: 560px; max-width: 95vw"
    >
      <n-form ref="createRef" :model="createForm" :rules="createRules" label-placement="top">
        <n-form-item :label="t('users.app')" path="appId">
          <n-select
            v-model:value="createForm.appId"
            :options="appOptions"
            :placeholder="t('users.selectApp')"
          />
        </n-form-item>
        <n-form-item :label="t('users.username')" path="username">
          <n-input v-model:value="createForm.username" />
        </n-form-item>
        <n-form-item :label="t('users.email')" path="email">
          <n-input v-model:value="createForm.email" />
        </n-form-item>
        <n-form-item :label="t('users.mobile')" path="mobile">
          <n-input v-model:value="createForm.mobile" />
        </n-form-item>
        <n-form-item :label="t('users.firstName')" path="firstName">
          <n-input v-model:value="createForm.firstName" />
        </n-form-item>
        <n-form-item :label="t('users.lastName')" path="lastName">
          <n-input v-model:value="createForm.lastName" />
        </n-form-item>
        <n-form-item :label="t('users.password')" path="password">
          <n-input v-model:value="createForm.password" type="password" show-password-on="click" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreate = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="creating" @click="submitCreate">{{ t('common.create') }}</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showStatusConfirm"
      preset="dialog"
      type="warning"
      :title="statusTarget?.status ? t('users.deactivateTitle') : t('users.activateTitle')"
      :positive-text="t('common.confirm')"
      :negative-text="t('common.cancel')"
      :loading="statusSaving"
      @positive-click="confirmStatusChange"
    >
      {{
        t(statusTarget?.status ? 'users.deactivateConfirm' : 'users.activateConfirm', {
          user: statusTarget?.username || '',
        })
      }}
    </n-modal>

    <n-modal
      v-model:show="showApps"
      preset="card"
      :title="t('users.appsModalTitle', { user: appsUser?.username || '' })"
      style="width: 640px; max-width: 95vw"
      @after-leave="resetAppsModal"
    >
      <n-spin :show="appsLoading">
        <n-space vertical :size="16">
          <div>
            <n-text strong>{{ t('users.associatedApps') }}</n-text>
            <n-empty
              v-if="!userApps.length"
              :description="t('users.noAssociatedApps')"
              style="margin-top: 8px"
            />
            <n-list v-else bordered style="margin-top: 8px">
              <n-list-item v-for="app in userApps" :key="app.id">
                <n-thing :title="app.title" :description="app.url" />
                <template #suffix>
                  <n-button
                    size="small"
                    type="error"
                    quaternary
                    :disabled="appsBusy"
                    @click="askRemoveApp(app)"
                  >
                    {{ t('users.removeApp') }}
                  </n-button>
                </template>
              </n-list-item>
            </n-list>
          </div>

          <div>
            <n-text strong>{{ t('users.addApp') }}</n-text>
            <n-space style="margin-top: 8px" align="center">
              <n-select
                v-model:value="selectedAppId"
                :options="availableAppOptions"
                :placeholder="t('users.selectApp')"
                style="min-width: 240px"
                :disabled="!availableAppOptions.length || appsBusy"
              />
              <n-button
                type="primary"
                :loading="appsBusy"
                :disabled="selectedAppId == null"
                @click="addApp"
              >
                {{ t('users.associateApp') }}
              </n-button>
            </n-space>
            <n-text v-if="!availableAppOptions.length" depth="3" style="display: block; margin-top: 8px">
              {{ t('users.noAvailableApps') }}
            </n-text>
          </div>
        </n-space>
      </n-spin>
    </n-modal>

    <n-modal
      v-model:show="showRemoveApp"
      preset="dialog"
      type="warning"
      :title="t('users.removeAppTitle')"
      :positive-text="t('common.confirm')"
      :negative-text="t('common.cancel')"
      :loading="appsBusy"
      @positive-click="confirmRemoveApp"
    >
      {{
        t('users.removeAppConfirm', {
          app: removeAppTarget?.title || '',
          user: appsUser?.username || '',
        })
      }}
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NButton,
  NIcon,
  NSpace,
  NSwitch,
  NTag,
  NTooltip,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { AppsOutline } from '@vicons/ionicons5'
import { appsApi } from '../../api/apps'
import { usersApi } from '../../api/users'
import type { AppDto } from '../../types/app'
import type { UserDto } from '../../types/user'
import { getApiError } from '../../utils/error'

const { t, locale } = useI18n()
const message = useMessage()

const loading = ref(false)
const creating = ref(false)
const statusSaving = ref(false)
const appsLoading = ref(false)
const appsBusy = ref(false)
const rows = ref<UserDto[]>([])
const allApps = ref<AppDto[]>([])

const showCreate = ref(false)
const showStatusConfirm = ref(false)
const showApps = ref(false)
const showRemoveApp = ref(false)
const statusTarget = ref<UserDto | null>(null)
const appsUser = ref<UserDto | null>(null)
const userApps = ref<AppDto[]>([])
const selectedAppId = ref<number | null>(null)
const removeAppTarget = ref<AppDto | null>(null)

const createRef = ref<FormInst | null>(null)
const createForm = reactive({
  appId: null as number | null,
  username: '',
  email: '',
  mobile: '',
  firstName: '',
  lastName: '',
  password: '',
})

const appOptions = computed(() =>
  allApps.value.map((a) => ({ label: a.title, value: a.id })),
)

const availableAppOptions = computed(() => {
  const linked = new Set(userApps.value.map((a) => a.id))
  return allApps.value
    .filter((a) => !linked.has(a.id))
    .map((a) => ({ label: a.title, value: a.id }))
})

const createRules: FormRules = {
  appId: {
    required: true,
    type: 'number',
    message: () => t('fieldRequired', { field: t('users.app') }),
    trigger: 'change',
  },
  username: {
    required: true,
    message: () => t('fieldRequired', { field: t('users.username') }),
    trigger: 'blur',
  },
  email: {
    required: true,
    message: () => t('fieldRequired', { field: t('users.email') }),
    trigger: 'blur',
  },
  mobile: {
    required: true,
    message: () => t('fieldRequired', { field: t('users.mobile') }),
    trigger: 'blur',
  },
  password: {
    required: true,
    min: 6,
    message: () => t('validation.passwordMinLength'),
    trigger: 'blur',
  },
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

const columns: DataTableColumns<UserDto> = [
  { title: () => t('users.username'), key: 'username' },
  {
    title: () => t('users.status'),
    key: 'status',
    render: (row) =>
      h(
        NTag,
        { type: row.status ? 'success' : 'warning', size: 'small' },
        () => (row.status ? t('users.statusActive') : t('users.statusInactive')),
      ),
  },
  {
    title: () => t('users.apps'),
    key: 'apps',
    ellipsis: { tooltip: true },
    render: (row) =>
      (row.apps || []).map((a) => a.title).filter(Boolean).join(', ') || t('common.empty'),
  },
  {
    title: () => t('common.actions'),
    key: 'actions',
    width: 140,
    render: (row) =>
      h(NSpace, { size: 4, align: 'center' }, () => [
        h(NSwitch, {
          value: row.status,
          loading: statusSaving.value && statusTarget.value?.id === row.id,
          onUpdateValue: () => askStatusChange(row),
        }),
        actionBtn(AppsOutline, t('users.manageApps'), () => openApps(row)),
      ]),
  },
]

async function load() {
  loading.value = true
  try {
    const [{ data: users }, { data: apps }] = await Promise.all([
      usersApi.list(),
      appsApi.list(),
    ])
    rows.value = users || []
    allApps.value = apps || []
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  createForm.appId = null
  createForm.username = ''
  createForm.email = ''
  createForm.mobile = ''
  createForm.firstName = ''
  createForm.lastName = ''
  createForm.password = ''
  showCreate.value = true
}

async function submitCreate() {
  try {
    await createRef.value?.validate()
  } catch {
    return
  }
  const app = allApps.value.find((a) => a.id === createForm.appId)
  if (!app?.accessToken) {
    message.error(t('fieldRequired', { field: t('apps.accessToken') }))
    return
  }
  creating.value = true
  try {
    await usersApi.create({
      username: createForm.username,
      email: createForm.email,
      mobile: createForm.mobile,
      firstName: createForm.firstName || undefined,
      lastName: createForm.lastName || undefined,
      password: createForm.password,
      accessToken: app.accessToken,
    })
    message.success(t('users.createSuccess'))
    showCreate.value = false
    await load()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    creating.value = false
  }
}

function askStatusChange(row: UserDto) {
  statusTarget.value = row
  showStatusConfirm.value = true
}

async function confirmStatusChange() {
  if (!statusTarget.value) return false
  statusSaving.value = true
  try {
    const next = !statusTarget.value.status
    await usersApi.updateStatus(statusTarget.value.id, { status: next })
    message.success(t('common.success'))
    showStatusConfirm.value = false
    statusTarget.value = null
    await load()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
    return false
  } finally {
    statusSaving.value = false
  }
}

async function openApps(row: UserDto) {
  appsUser.value = row
  selectedAppId.value = null
  showApps.value = true
  appsLoading.value = true
  try {
    const { data } = await usersApi.getApps(row.id)
    userApps.value = data || []
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
    userApps.value = []
  } finally {
    appsLoading.value = false
  }
}

function resetAppsModal() {
  appsUser.value = null
  userApps.value = []
  selectedAppId.value = null
  removeAppTarget.value = null
}

async function addApp() {
  if (!appsUser.value || selectedAppId.value == null) return
  appsBusy.value = true
  try {
    const { data } = await usersApi.associateApp(appsUser.value.id, {
      appId: selectedAppId.value,
    })
    userApps.value = data.apps || []
    selectedAppId.value = null
    message.success(t('users.associateSuccess'))
    await load()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
  } finally {
    appsBusy.value = false
  }
}

function askRemoveApp(app: AppDto) {
  removeAppTarget.value = app
  showRemoveApp.value = true
}

async function confirmRemoveApp() {
  if (!appsUser.value || !removeAppTarget.value) return false
  appsBusy.value = true
  try {
    await usersApi.removeApp(appsUser.value.id, removeAppTarget.value.id)
    message.success(t('users.removeAppSuccess'))
    showRemoveApp.value = false
    const { data } = await usersApi.getApps(appsUser.value.id)
    userApps.value = data || []
    removeAppTarget.value = null
    await load()
  } catch (e) {
    message.error(getApiError(e) || t('common.error'))
    return false
  } finally {
    appsBusy.value = false
  }
}

onMounted(load)
</script>
