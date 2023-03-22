<template>
  <div>
    <div class="text-3xl my-4">
      {{ value }}
    </div>
    <div class="text-subtle">
      {{ description }}
    </div>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class SingleDatasetComponent extends Vue {
  @Prop() value!: number
  @Prop({ default: undefined }) description!: string
}
</script>
