<template>
  <div class="rounded-xl bg-steel-grey text-center p-4 min-w-32 inline-block">
    <p class="font-bold text-4xl">
      {{ valueShortScale }}
      <span
        v-if="totalShortScale"
        class="text-base font-normal"
      >/ {{ totalShortScale }}</span>
    </p>
    <p>
      {{ subtitle }}
    </p>
  </div>
</template>
<script lang="ts">
import numeral from 'numeral'
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class NumericMetric extends Vue {
  get valueShortScale (): string {
    return numeral(this.value).format('0a')
  }

  get totalShortScale (): string | null {
    return this.totalValue === null ? this.totalValue : numeral(this.totalValue).format('0a')
  }

  @Prop() value!: number
  @Prop({ default: null }) totalValue!: number | null
  @Prop() subtitle!: string
}
</script>
