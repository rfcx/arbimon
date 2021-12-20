import { Howl } from 'howler'
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { SpeciesCall } from '@rfcx-bio/common/api-bio-types/species'

import { assetsService } from '@/activity-patterns/services'

export default class SpotlightPlayer extends Vue {
  @Prop() speciesCall!: SpeciesCall

  loading = false

  spectrogram = ''
  audio: Howl | null = null
  playing = false

  override async created (): Promise<void> {
    this.loading = true
    await Promise.all([
      await this.getSpectrogramImage(),
      await this.getAudio()
    ])
    this.loading = false
  }

  async getSpectrogramImage (): Promise<void> {
    const data = await assetsService.getSpectrogramImage(this.speciesCall.mediaSpecUrl)
    this.spectrogram = data ? window.URL.createObjectURL(data) : ''
  }

  async getAudio (): Promise<void> {
    const data = await assetsService.getAudio(this.speciesCall.mediaWavUrl)
    if (!data) {
      this.audio = null
      return
    }

    this.audio = new Howl({
      src: [window.URL.createObjectURL(data)],
      html5: true,
      onend: () => {
        this.playing = false
      },
      onpause: () => {
        this.playing = false
      },
      onplay: () => {
        this.playing = true
      }
    })
  }

  async play (): Promise<void> {
    this.audio?.play()
  }

  async pause (): Promise<void> {
    this.audio?.pause()
  }
}
