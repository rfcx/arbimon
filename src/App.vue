<template>
  <div id="main">
    <div
      v-if="loading"
      class="text-white"
    >
      {{ loading }}
      loading...
    </div>
    <div v-else>
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

  public get loading (): boolean {
    return this.auth.loading.value
  }

  public get user (): Auth0User {
    return this.auth.user.value
  }
}
</script>
