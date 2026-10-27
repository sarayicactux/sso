import { createI18n } from 'vue-i18n'
import en from './en'
import fa from './fa'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'fa',
  fallbackLocale: 'en',
  messages: { en, fa },
})

export default i18n
