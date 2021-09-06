<template>
  <div id="main">
    <div v-if="isLoading">
      loading
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>
<script lang='ts'>
import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { ComputedRef } from '@vue/reactivity'

import { Auth0Option, Auth0User } from './models'
import { VXServices } from './services'

@Options({})
export default class RootPage extends Vue {
  @Inject()
  readonly auth!: Auth0Option

  public async mounted (): Promise<void> {
    await VXServices.Auth.auth.set(this.auth)
    await VXServices.Auth.user.set(this.user)
  }

  public get isLoading (): boolean {
    const loading = this.auth.loading as ComputedRef
    return loading.value ?? true
  }

  public get user (): Auth0User {
    return this.auth.user.value
  }
}
</script>
