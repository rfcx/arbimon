<template>
  <div>
    <metrics-title-view
      :title="title"
      :information="hint"
    />
    <div class="text-3xl my-4">
      {{ value }}
    </div>
    <div>
      {{ description }}
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
export default class SingleDatasetComponent extends Vue {
  @Prop() title!: string
  @Prop() value!: string
  @Prop({ default: undefined }) hint!: string
  @Prop({ default: undefined }) description!: string
}
</script>
