import VueAuth from './auth/vueAuth'

declare module 'vue/types/vue' {
  interface CustomProperties {
    $auth: VueAuth
  }
}
