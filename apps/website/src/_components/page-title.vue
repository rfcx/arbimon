<template>
  <div class="flex flex-row justify-between items-center w-full">
    <div>
      <div class="flex flex-row items-baseline">
        <h1 class="text-4xl capitalize py-1 mr-2">
          {{ pageTitle }}
        </h1>
      </div>
      <p class="text-sm">
        {{ pageSubtitle }}
        <span v-if="topic">&nbsp;·&nbsp;</span>
        <router-link
          v-if="topic"
          :to="learnmoreRoute"
          class="text-subtle inline hover:(underline text-white cursor-pointer)"
        >
          Learn more
        </router-link>
      </p>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'
import { RouteLocationRaw } from 'vue-router'

import { routeNamesKey } from '@/globals'
import { RouteNames } from '~/router'

export default class PageTitle extends Vue {
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames

  @Prop() pageTitle!: string
  @Prop({ default: '' }) pageSubtitle!: string
  @Prop() pageInformation!: string
  @Prop() topic!: string

  get learnmoreRoute (): RouteLocationRaw {
    return {
      name: this.ROUTE_NAMES.info,
      hash: `#${this.topic}`
    }
  }

  get popoverPlacement (): string {
    return screen.width > 640 ? 'right' : 'bottom'
  }
}
</script>

<style lang="scss">
.info-popover {
  width: 360px !important;
  word-break: normal !important;
  @media (max-width: 640px) {
    width: 120px !important;
  }
}
</style>
