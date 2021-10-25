<template>
  <div class="flex flex-row">
    <div>
      {{ title }}
    </div>
    <div>
      <icon-fa-info-circle-outline />
    </div>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import MetricsTitleView from './metrics-title.vue'

@Options({
  components: {
    MetricsTitleView
  }
})
export default class MultiDatasetsComponent extends Vue {
  @Prop() title!: string
  @Prop({ default: undefined }) information!: string
}
</script>
