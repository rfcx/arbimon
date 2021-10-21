<template>
  <div>
    <metrics-title-view
      :title="'test'"
      :information="'test info'"
    />
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
export default class SingleDatasetComponent extends Vue {
  @Prop({ default: undefined }) information!: string
}
</script>
