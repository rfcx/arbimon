import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export const INFO_TOPICS = {
  richness: 'richness',
  activity: 'activity',
  spotlight: 'spotlight'
}

export default class InfoPage extends Vue {
  @Prop({ default: '' }) selectedTopic!: string

  topics = INFO_TOPICS

  override created (): void {
    console.info('selectedTopic', this.selectedTopic)
  }
}
