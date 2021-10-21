import { Options, Vue } from 'vue-class-component'

import SingleDatasetComponent from './single-dataset-component.vue'

@Options({
  components: {
    SingleDatasetComponent
  }
})
export default class ActivityPatternsMetrics extends Vue {
  get metricsInformation (): any {
    return [
      {
        title: 'Detection frequency',
        information: 'Number of recordings as a proportion of total recordings',
        datasets: [
          {
            value: 25,
            description: 'Found in 25 recordings out of 100 recordings'
          },
          {
            value: 35,
            description: 'Found in 350 recordings out of 1000 recordings'
          }
        ]
      },
      {
        title: 'Occupancy',
        information: 'Number of sites with a detection',
        datasets: [
          {
            value: 45,
            description: 'Found in 45 sites out of 100 sites'
          },
          {
            value: 50,
            description: 'Found in 25 sites out of 50 sites'
          }
        ]
      }
    ]
  }
}
