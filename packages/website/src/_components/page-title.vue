<template>
  <div class="flex flex-row justify-between items-center w-full">
    <div>
      <h1 class="text-4xl capitalize">
        {{ pageTitle }}
      </h1>
      <p class="italic">
        {{ pageSubtitle }}
      </p>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class SpeciesRichnessIntroduction extends Vue {
  @Prop() pageTitle!: string
  @Prop({ default: '' }) pageSubtitle!: string
}
</script>
