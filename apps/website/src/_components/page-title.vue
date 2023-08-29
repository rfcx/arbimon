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
        <button
          v-if="topic"
          class="text-subtle inline hover:(underline text-insight cursor-pointer)"
          @click="showLearnMoreModal = true"
        >
          Learn more
        </button>
      </p>
    </div>
    <slot />
  </div>
  <InfoModal
    v-if="showLearnMoreModal"
    :topic="topic"
    @close="showLearnMoreModal = false"
  />
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { Inject, Options, Prop } from 'vue-property-decorator'

import { routeNamesKey } from '@/globals'
import InfoModal from '~/info/info-modal.vue'
import type { RouteNames } from '~/router'

@Options({
  components: {
    InfoModal
  }
})
export default class PageTitle extends Vue {
  @Inject({ from: routeNamesKey }) readonly ROUTE_NAMES!: RouteNames

  @Prop() pageTitle!: string
  @Prop({ default: '' }) pageSubtitle!: string
  @Prop() pageInformation!: string
  @Prop() topic!: string

  showLearnMoreModal = false
}
</script>
