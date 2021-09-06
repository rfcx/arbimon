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
          <!-- <div class="text-white">
            hello{{ auth }}
          </div> -->
          <div class="flex items-center mx-4">
            <button
              v-if="!auth.isAuthenticated"
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
              <div class="text-white">
                Name: {{ user }}
              </div>
              <!-- <div class="dropdown-content">
                <a
                  href="#"
                  @click="logout"
                >
                  Sign out
                </a>
              </div>
              <button
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
    <div>
      <router-view />
    </div>
  </div>
</template>
<script lang='ts'>
import { Options, Vue } from 'vue-class-component'
import { Inject } from 'vue-property-decorator'

// import VueAuth from './auth/vueAuth'
import {
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions
} from '@auth0/auth0-spa-js'

import { ROUTES_NAME } from '@/router'
import { Auth0User } from './models'

interface NavMenus {
  label: string
  routerPath: string
  role?: string[]
}

interface Auth0Option {
  isAuthenticated: boolean
  loading: boolean
  user: Auth0User
  getIdTokenClaims: (o: GetIdTokenClaimsOptions) => Promise<IdToken>
  getTokenSilently: (o: GetTokenSilentlyOptions) => Promise<void>
  getTokenWithPopup: (o: GetTokenWithPopupOptions) => Promise<string>
  handleRedirectCallback: (o: GetTokenWithPopupOptions) => Promise<string>
  loginWithRedirect: (o: GetTokenWithPopupOptions) => Promise<string>
  logout: (o: LogoutOptions) => Promise<void> | void
}

@Options({})
export default class RootPage extends Vue {
  @Inject()
  auth!: Auth0Option

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

  public get user (): Auth0User {
    console.log(JSON.stringify(this.auth))
    return JSON.parse(JSON.stringify(this.auth.user))
  }

  public get userImage (): string {
    return this.user.picture ?? ''
  }

  // public async login (): Promise<void> {
  //   await this.auth.loginWithRedirect()
  // }

  // public async logout (): Promise<void> {
  //   await this.auth.logout({ returnTo: window.location.origin })
  // }

  // public get auth (): VueAuth {
  //   return this.$auth
  // }

  // public get isLoading (): boolean {
  //   return this.auth?.isLoaded ?? true
  // }

  // public get user (): Auth0User | undefined {
  //   return this.auth?.user
  // }

  // public get userImage (): string {
  //   return this.user?.picture ?? ''
  // }

  // public get isAuthenticated (): boolean {
  //   return this.auth?.isAuth0Authenticated ?? false
  // }
}
</script>
