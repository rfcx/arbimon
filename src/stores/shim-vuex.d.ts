import store from '.'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: typeof store
  }
}
