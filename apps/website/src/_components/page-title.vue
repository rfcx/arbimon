<template>
  <div class="flex flex-row justify-between items-top w-full">
    <div>
      <div class="flex flex-row items-baseline">
        <h1 class="text-4xl capitalize py-1 mr-2">
          {{ pageTitle }}
        </h1>
        <el-popover
          v-if="pageInformation"
          trigger="hover"
          :placement="popoverPlacement"
          popper-class="info-popover"
        >
          <div class="break-words">
            {{ pageInformation }}
            <router-link
              v-if="topic"
              :to="learnmoreRoute"
              class="text-subtle hover:(underline text-white cursor-pointer)"
            >
              Learn more
            </router-link>
          </div>
          <template #reference>
            <icon-fas-info-circle />
          </template>
        </el-popover>
      </div>
      <p class="text-subtle text-sm">
        {{ pageSubtitle }}
      </p>
    </div>
    <slot />
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Inject, Prop } from 'vue-property-decorator'
import { RouteLocationRaw } from 'vue-router'

import { RouteNames } from '~/router'

export default class PageTitle extends Vue {
  get learnmoreRoute (): RouteLocationRaw {
    return {
      name: this.ROUTE_NAMES.info,
      params: {
        topic: this.topic
      }
    }
  }

  get popoverPlacement (): string {
    return screen.width > 640 ? 'right' : 'bottom'
  }

  @Inject() readonly ROUTE_NAMES!: RouteNames
  @Prop() pageTitle!: string
  @Prop({ default: '' }) pageSubtitle!: string
  @Prop() pageInformation!: string
  @Prop() topic!: string
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
