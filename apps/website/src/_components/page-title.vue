<template>
  <div class="flex flex-row justify-between items-top w-full">
    <div>
      <h1 class="text-4xl capitalize py-1">
        {{ pageTitle }}
      </h1>
      <p class="text-subtle text-sm">
        {{ pageSubtitle }}
      </p>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class PageTitle extends Vue {
  @Prop() pageTitle!: string
  @Prop({ default: '' }) pageSubtitle!: string
}
</script>
