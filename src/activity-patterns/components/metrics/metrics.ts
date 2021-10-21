import { Options, Vue } from 'vue-class-component'

import SingleDatasetComponent from './single-dataset-component.vue'

@Options({
  components: {
    SingleDatasetComponent
  }
})
export default class ActivityPatternsMetrics extends Vue {

}
