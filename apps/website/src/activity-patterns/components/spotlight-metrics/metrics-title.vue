<template>
  <div class="flex flex-row items-center">
    <div class="capitalize text-xl mr-2">
      {{ title }}
    </div>
    <div
      v-if="information"
      class="relative hover:cursor-pointer focus:cursor-pointer group"
    >
      <icon-fa-info-circle />
      <p
        class="absolute min-w-70 -left-24 -top-20 z-10 mx-auto bg-box-grey mt-2 py-2 px-4 invisible whitespace-pre-wrap group-hover:visible rounded-md"
      >
        {{ information }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class MetricsTitleView extends Vue {
  @Prop() title!: string
  @Prop({ default: undefined }) information!: string
}
</script>
