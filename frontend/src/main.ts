import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive, { NModal } from 'naive-ui'
import App from './App.vue'

if (NModal.props?.maskClosable) {
  NModal.props.maskClosable.default = false
}
if (NModal.props?.closeOnEsc) {
  NModal.props.closeOnEsc.default = false
}

import router from './router'
import i18n from './i18n'
import { toPersianDigits } from './utils/persianDigits'
import './assets/styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(naive)
app.config.globalProperties.$persianDigits = toPersianDigits
app.mount('#app')
