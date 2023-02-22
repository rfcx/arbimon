import { Vue } from 'vue-class-component'

export const INFO_TOPICS = {
  richness: 'richness',
  activity: 'activity',
  spotlight: 'spotlight'
}

export default class InfoPage extends Vue {
  selectedTopic = ''
  topics = INFO_TOPICS

  override created (): void {
    this.selectedTopic = this.$route.hash
  }
}
