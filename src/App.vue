<template>
  <div>
    <router-view />
  </div>
</template>
<script lang='ts'>
import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { Auth0Option, Auth0User } from './models'
import { VXServices } from './services'

export default class RootPage extends Vue {
  @Inject()
  readonly auth!: Auth0Option

  public async created (): Promise<void> {
    await VXServices.Auth.auth.set(this.auth)
    await VXServices.Auth.user.set(this.user)
  }

  public get loading (): boolean {
    return this.auth.loading.value
  }

  public get user (): Auth0User {
    return this.auth.user.value
  }
}
</script>
