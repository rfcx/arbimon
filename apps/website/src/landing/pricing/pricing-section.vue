<template>
  <landing-navbar />
  <div class="min-h-screen bg-black text-white py-20 px-4 font-sans">
    <div class="text-center mb-16">
      <h1 class="text-[42px] mb-2">
        Pricing
      </h1>
      <p class="text-[#777777] text-[22px] font-medium">
        Start for free. Unlock for more.
      </p>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <div class="bg-[#0D0D0D] rounded-3xl p-5 flex flex-col h-full">
        <div class="flex-grow">
          <div class="mb-8">
            <h3 class="text-[#555555] text-[15px] mb-3">
              Basic
            </h3>
            <h2 class="text-[32px] font-bold mb-3 font-sans">
              Free
            </h2>
            <p class="text-[#555555] text-[13px] leading-relaxed mr-12">
              Ideal for low usage, exploratory users & project contributors
            </p>
          </div>

          <ul class="space-y-4">
            <li
              v-for="feature in basicFeatures"
              :key="feature"
              class="flex items-center text-[14px] text-[#555555]"
            >
              <CheckIcon class="w-4 h-4 mr-3 text-gray-400" />
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="mt-10">
          <button
            class="h-[40px] w-full bg-[#ffffff14] hover:bg-[#ffffff20] transition-colors py-3 rounded-xl text-[14px]"
            @click="signup"
          >
            Start with Basic
          </button>
          <p class="mt-4 h-[40px] invisible text-[13px]">
            spacer
          </p>
        </div>
      </div>

      <div class="bg-[#0D0D0D] rounded-3xl p-5 flex flex-col h-full relative">
        <div class="flex-grow">
          <div class="mb-8">
            <h3 class="text-[#49FF50] text-[15px] mb-3">
              Pro
            </h3>
            <div class="flex items-baseline gap-1 mb-4 font-sans">
              <span class="text-[32px] font-bold">$995</span>
              <span class="text-[#908B8B] text-[15px]">/ year</span>
            </div>
            <p class="text-[#8F8B8B] text-[13px] leading-relaxed mr-12">
              Dedicated to users leading an active project.
            </p>
          </div>

          <ul class="space-y-4">
            <li
              v-for="feature in proFeatures"
              :key="feature"
              class="flex items-center text-sm text-[#8F8B8B]"
            >
              <CheckIcon class="w-4 h-4 mr-3 text-[#49FF50]" />
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="mt-10">
          <a
            href="https://buy.stripe.com/8x2bJ29cl3PC6xN4VtfnO00"
            target="_blank"
            class="w-full"
          >
            <button class="h-[40px] w-full bg-[#4aff50] hover:opacity-80 text-black rounded-xl text-[14px] transition-colors">
              Start with Pro
            </button>
          </a>
          <p class="text-center text-[13px] text-[#D9D9D9] mt-4 px-6 leading-tight h-[40px]">
            Unlock additional projects for $99/year per premium project.
          </p>
        </div>
      </div>

      <div class="bg-[#0D0D0D] rounded-3xl p-5 flex flex-col h-full">
        <div class="flex-grow">
          <div class="mb-8">
            <h3 class="text-[#FFF2F2] text-[15px] mb-3">
              Enterprise
            </h3>
            <h2 class="text-[32px] font-sans font-bold mb-3">
              Contact us
            </h2>
            <p class="text-[#8F8B8B] text-[13px] leading-relaxed mr-12">
              Perfect for users with multiple or high-scale projects
            </p>
          </div>

          <ul class="space-y-4">
            <li
              v-for="feature in enterpriseFeatures"
              :key="feature"
              class="flex items-center text-[14px] text-[#8F8B8B]"
            >
              <CheckIcon class="w-4 h-4 mr-3 text-white" />
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="mt-10 flex flex-col items-center">
          <a
            href="mailto:contact@arbimon.org"
            class="w-full"
          >
            <button class="h-[40px] w-full bg-[#F7F7F7] hover:opacity-80 text-[#302F2F] text-[14px] rounded-xl transition-colors">
              Get in touch
            </button>
          </a>

          <p class="max-w-[200px] mx-auto text-center text-[13px] text-[#d9d9d9] mt-4 leading-tight h-[40px]">
            Contact us to unlock additional projects.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Auth0Client } from '@auth0/auth0-spa-js'
import { type AxiosInstance } from 'axios'
import { defineComponent, h, inject } from 'vue'

import { apiArbimonLegacyClearSession } from '@rfcx-bio/common/api-arbimon/legacy-logout'

import LandingNavbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { apiClientArbimonLegacyKey, authClientKey } from '@/globals'
import { ROUTE_NAMES } from '~/router'

const auth = inject(authClientKey) as Auth0Client
const apiClientArbimonLegacy = inject(apiClientArbimonLegacyKey) as AxiosInstance

const CheckIcon = defineComponent({
  render () {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
        clipRule: 'evenodd'
      })
    ])
  }
})

const basicFeatures: string[] = [
  '5 Projects',
  '40,000 Minutes of Recordings',
  'Publicly Accessible Insights'
]

const proFeatures: string[] = [
  '50 Projects',
  '1 Million Minutes of Recordings',
  '4 Collaborators',
  '3 Guests',
  'Data Privacy Toggle',
  'Download / Export Projects'
]

const enterpriseFeatures: string[] = [
  'Unlimited Projects',
  'Unlimited Recording Minutes',
  'Unlimited Collaborators',
  'Unlimited Guests',
  'Data Privacy Toggle',
  'Download / Export Projects',
  'Dedicated Enterprise Manager'
]

const signup = async (): Promise<void> => {
  await apiArbimonLegacyClearSession(apiClientArbimonLegacy).catch(() => {})
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, screen_hint: 'signup' })
}
</script>
