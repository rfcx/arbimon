<template>
  <div class="min-h-screen bg-black text-util-gray-02 py-20 px-4 font-sans border-b border-b-frequency">
    <div class="text-center mb-16">
      <h1 class="text-[40px] mb-2 text-insight text-bold">
        Pricing
      </h1>
      <p class="text-[18px] font-medium">
        Start for free. Unlock for more.
      </p>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <div class="bg-echo rounded-3xl p-5 flex flex-col h-full">
        <div class="flex-grow">
          <div class="mb-8">
            <h3 class="text-[15px] mb-3">
              Basic
            </h3>
            <h2 class="text-[32px] text-insight font-bold mb-3 font-sans ">
              Free
            </h2>
            <p class="text-[13px] leading-relaxed mr-28">
              For explorers, contributors, and light use.
            </p>
          </div>

          <ul class="space-y-4">
            <li class="flex items-center text-[14px]">
              <CheckIcon class="w-4 h-4 mr-3 text-gray-400" />
              <span class="font-medium items-center">5 Free projects</span>
            </li>
            <li class="flex items-start text-[12px] ml-7">
              <span class="italic">Each Free project includes</span>
            </li>
            <li
              v-for="feature in basicSubFeatures"
              :key="feature"
              class="flex items-center text-[14px] ml-7"
            >
              <span class="mr-3 text-gray-400 font-bold text-[18px] leading-[20px]">•</span>
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="mt-10">
          <button
            disabled
            class="h-[40px] w-full bg-[#ffffff14] text-[#fff] opacity-50 cursor-not-allowed transition-colors py-3 rounded-full text-[14px]"
            @click="signup"
          >
            Start with Basic
          </button>
          <p class="mt-4 h-[40px] invisible text-[13px]">
            spacer
          </p>
        </div>
      </div>

      <div class="bg-echo rounded-3xl p-5 flex flex-col h-full relative">
        <div class="flex-grow">
          <div class="mb-8">
            <h3 class="text-frequency text-[15px] mb-3">
              Pro
            </h3>
            <div class="flex items-baseline gap-1 mb-3 font-sans">
              <span class="text-[32px] font-bold text-insight">$995</span>
              <span class=" text-[15px]">/ year</span>
            </div>
            <p class="text-[13px] leading-relaxed mr-12">
              For teams and individuals managing active projects.
            </p>
          </div>

          <ul class="space-y-4">
            <li class="flex items-center text-[14px]">
              <CheckIcon class="w-4 h-4 mr-3 text-frequency" />
              <span class="font-medium">50 Free projects</span>
            </li>

            <li class="flex items-center text-[14px]">
              <CheckIcon class="w-4 h-4 mr-3 text-frequency" />
              <span class="font-medium">2 Premium projects</span>
            </li>

            <li class="flex items-start text-[12px] ml-7">
              <span class="italic">Each Premium project includes</span>
            </li>

            <li
              v-for="subFeature in [
                { text: '1 million minutes of recordings' },
                { text: '7 members plus owner', sub: '(up to 4 collaborators*)' },
                { text: 'Private project option' },
                { text: 'Export project data' }
              ]"
              :key="subFeature.text"
              class="flex items-start text-[14px] ml-7"
            >
              <span class="mr-3 font-bold text-frequency text-[18px] h-[21px] flex items-center">•</span>

              <div class="flex flex-col">
                <span class="leading-[21px]">{{ subFeature.text }}</span>

                <span
                  v-if="subFeature.sub"
                  class="text-[10px] mt-1 leading-none"
                >{{ subFeature.sub }}</span>
              </div>
            </li>
          </ul>
        </div>

        <div class="mt-10">
          <button
            disabled
            class="h-[40px] w-full bg-frequency opacity-50 cursor-not-allowed text-black rounded-full text-[14px] transition-colors"
          >
            Start with Pro
          </button>
          <p class="text-center text-[13px] mt-4 px-8 leading-tight h-[40px]">
            Add premium projects for $99/year each.
          </p>
        </div>
      </div>

      <div class="bg-echo rounded-3xl p-5 flex flex-col h-full">
        <div class="flex-grow">
          <div class="mb-8">
            <h3 class="text-insight text-[15px] mb-3">
              Enterprise
            </h3>
            <h2 class="text-[32px] font-sans font-bold mb-3 text-insight">
              Contact Us
            </h2>
            <p class=" text-[13px] leading-relaxed mr-12">
              For multiple and large-scale projects.
            </p>
          </div>

          <ul class="space-y-4">
            <li
              v-for="feature in enterpriseFeatures"
              :key="feature"
              class="flex items-center text-[14px]"
            >
              <CheckIcon class="w-4 h-4 mr-3 text-white" />
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="mt-10 flex flex-col items-center">
          <button
            disabled
            class="h-[40px]  opacity-50 cursor-not-allowed w-full bg-[#F7F7F7] text-[#302F2F] text-[14px] rounded-full transition-colors"
          >
            Get in touch
          </button>

          <p class="text-center text-[13px] mt-4 leading-tight h-[40px] px-12">
            Contact us for custom project limits.
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

const basicSubFeatures = [
  '40,000 minutes of recordings',
  '1 member (owner only)',
  'Public visibility for project insights',
  'Export project data'
]

const enterpriseFeatures: string[] = [
  'Unlimited projects',
  'Unlimited recordings',
  'Unlimited members',
  'Private project option',
  'Export project data',
  'Dedicated Account Support'
]

const signup = async (): Promise<void> => {
  await apiArbimonLegacyClearSession(apiClientArbimonLegacy).catch(() => {})
  await auth.loginWithRedirect({ appState: { target: { name: ROUTE_NAMES.myProjects } }, screen_hint: 'signup' })
}
</script>
