<template>
  <div>
    <router-view />
  </div>
</template>
<script lang='ts'>
import { Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

import { Auth0Option, Auth0User } from '@/_services/auth/types'
import { VuexAuth } from '@/_services/stores/vuex-service'

export default class App extends Vue {
  @Inject() readonly auth!: Auth0Option

  get loading (): boolean {
    return this.auth.loading.value
  }

  get user (): Auth0User {
    return this.auth.user.value
  }

  async created (): Promise<void> {
    await VuexAuth.auth.set(this.auth)
    await VuexAuth.user.set(this.user)
  }
}
</script>
