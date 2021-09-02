<template>
  <div id="main">
    <div class="navbar">
      <nav class="bg-brand-gray">
        <div class="relative flex items-center justify-between h-13">
          <div
            to="/"
            class="flex-shrink-0 flex items-center mx-4"
          >
            <img
              class="h-9"
              src="https://avatars0.githubusercontent.com/u/2858735?s=200&v=4"
              alt="Rainforest connection logo"
            >
            <div class="font-semibold text-white">
              Biodiversity Analytics
            </div>
          </div>
          <div class="flex-1 flex items-center space-x-4">
            <router-link
              v-for="(item, idx) in navMenus"
              :key="'nav-menus-' + idx"
              :to="item.routerPath"
              class="box-content"
            >
              <div class="text-white">
                {{ item.label }}
              </div>
            </router-link>
          </div>
          <div class="flex items-center mx-4">
            <button
              v-if="!isAuthenticated"
              class="w-24 h-10 rounded-md bg-brand-green font-semibold text-white"
              @click="login"
            >
              Sign In
            </button>
            <div
              v-else
              class="flex flex-row"
            >
              <img
                id="avatar-img"
                aria-expanded="true"
                aria-haspopup="true"
                class="h-8 w-8 rounded-full"
                :src="auth.user.picture"
              >
              <!-- <div class="dropdown-content">
                <a
                  href="#"
                  @click="logout"
                >
                  Sign out
                </a>
              </div> -->
              <!-- <button
                class="w-24 h-10 rounded-md bg-brand-green font-semibold text-white"
                @click="logout"
              >
                Sign Out
              </button> -->
            </div>
          </div>
        </div>
      </nav>
    </div>
    <div v-if="!isLoading">
      <router-view />
    </div>
  </div>
</template>
<script lang='ts'>
import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { ROUTES_NAME } from '@/router'
import VueAuth, { UserComponent } from './auth/vueAuth'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

@Options({})
export default class RootPage extends Vue {
  public auth: VueAuth | undefined = undefined

  public get navMenus (): NavMenus[] {
    return [
      {
        label: 'Overview',
        routerPath: ROUTES_NAME.overview
      },
      {
        label: 'Species Richness',
        routerPath: ROUTES_NAME.species_richness
      }
    ]
  }

  @Watch('$auth', { immediate: true, deep: true })
  onAuthChange (currentVal: VueAuth, oldValue: VueAuth): void {
    console.log(currentVal, oldValue)
    this.auth = currentVal
  }

  public get isLoading (): boolean {
    return this.auth?.isLoading ?? true
  }

  public get user (): UserComponent | undefined {
    return this.auth?.user
  }

  public get userImage (): string {
    return this.user?.picture ?? ''
  }

  public get isAuthenticated (): boolean {
    return this.auth?.isAuth0Authenticated ?? false
  }

  public async login (): Promise<void> {
    await this.auth?.loginWithRedirect()
  }

  public async logout (): Promise<void> {
    await this.auth?.logout({ returnTo: window.location.origin })
  }
}
</script>
