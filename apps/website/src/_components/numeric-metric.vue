<template>
  <div class="rounded-xl bg-steel-grey text-center p-4 min-w-32 inline-block <sm:min-w-24">
    <p class="font-bold text-4xl <sm:text-2xl">
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
  @Prop() value!: number
  @Prop({ default: null }) totalValue!: number | null
  @Prop() subtitle!: string

  get valueShortScale (): string {
    return numeral(this.value).format('0a')
  }

  get totalShortScale (): string | null {
    return this.totalValue === null ? this.totalValue : numeral(this.totalValue).format('0a')
  }
}
</script>
