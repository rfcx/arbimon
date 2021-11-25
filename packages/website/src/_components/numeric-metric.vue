<template>
  <div class="rounded-2xl bg-steel-grey text-center p-4 w-50">
    <p class="font-bold text-3xl">
      {{ valueShortScale }}
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

  @Prop() value!: number
  @Prop() subtitle!: string
}
</script>
