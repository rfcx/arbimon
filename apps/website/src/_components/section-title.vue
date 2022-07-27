<template>
  <div class="flex justify-between md:(items-center) <md:(items-start)">
    <slot name="title">
      <h2 class="text-subtle text-xl">
        {{ title }}
        <span
          v-if="note"
          class="text-danger text-xs ml-1"
        >
          {{ note }}
        </span>
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
  @Prop({ default: '' }) note!: string
}
</script>
