<template>
  <div class="flex flex-row items-center group relative">
    <div class="capitalize text-xl text-subtle mr-2">
      {{ title }}
    </div>
    <div class="text-subtle hover:cursor-pointer focus:cursor-pointer">
      <icon-fa-info-circle />
    </div>
    <p
      class="absolute min-w-70 -top-20 z-10 mx-auto bg-box-gray mt-2 py-2 px-4 invisible whitespace-pre-wrap group-hover:visible rounded-md"
    >
      {{ information }}
    </p>
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
