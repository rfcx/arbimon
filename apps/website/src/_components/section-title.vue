<template>
  <div class="flex justify-between md:(items-center) <md:(items-start)">
    <slot name="title">
      <h2 class="text-subtle text-xl">
        {{ title }}
      </h2>
    </slot>
    <slot name="controls" />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class SectionTitle extends Vue {
  @Prop({ default: '' }) title!: string
}
</script>
