<template>
  <div id="main">
    <div
      v-if="auth.loading"
      class="text-white"
    >
      loading...
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>
<script lang='ts'>
import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

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

  public get user (): Auth0User {
    return this.auth.user.value
  }
}
</script>
