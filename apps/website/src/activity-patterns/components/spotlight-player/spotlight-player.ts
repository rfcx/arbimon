import { Howl } from 'howler'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop, Watch } from 'vue-property-decorator'

import { SpeciesCall } from '@rfcx-bio/common/domain'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { assetsService } from '@/activity-patterns/services'
import { BiodiversityStore } from '~/store'
import AudioController from './audio-controller.vue'

@Options({
  components: {
    AudioController
  }
})
export default class SpotlightPlayer extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() speciesCall!: SpeciesCall

  loading = false

  spectrogram = ''
  audio: Howl | null = null
  playing = false
  playedTime = 0
  playedProgressPercentage = 0

  get displayPlayedTime (): string {
    return `${dayjs.duration(this.playedTime, 'seconds').format('m:ss')}`
  }

  get emptyMedia (): boolean {
    return this.spectrogram === '' || this.audio === null
  }

  override async created (): Promise<void> {
    await this.getSpeciesCallAssets()
  }

  @Watch('speciesCall')
  async onSpeciesCallChange (): Promise<void> {
    await this.getSpeciesCallAssets()
  }

  async getSpeciesCallAssets (): Promise<void> {
    this.loading = true
    await Promise.all([
      this.getSpectrogramImage(),
      this.getAudio()
    ])
    this.loading = false
  }

  async getSpectrogramImage (): Promise<void> {
    const data = await assetsService.getMedia(this.speciesCall.mediaSpecUrl)
    if (!data) {
      this.spectrogram = ''
      return
    }

    this.spectrogram = window.URL.createObjectURL(data)
  }

  async getAudio (): Promise<void> {
    const data = await assetsService.getMedia(this.speciesCall.mediaWavUrl)
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
        this.audio?.stop()
      },
      onplay: () => {
        this.playing = true
        requestAnimationFrame(this.step)
      }
    })
  }

  step (): void {
    const audio = this.audio
    const seek = audio?.seek() ?? 0
    if (audio?.playing() ?? false) {
      this.playedTime = seek
      this.playedProgressPercentage = (seek / (audio?.duration() ?? 0)) * 100
      requestAnimationFrame(this.step)
    }
  }

  setAudioPlayProgerss (event: MouseEvent): void {
    const target = event.currentTarget as HTMLDivElement
    const targetWidth = target.offsetWidth
    const offsetX = event.offsetX
    const playedProgress = (offsetX / targetWidth)
    this.playedProgressPercentage = playedProgress * 100
    this.selectedDuration(playedProgress)
  }

  selectedDuration (progress: number): void {
    const audio = this.audio
    const selectedTime = (audio?.duration() ?? 0) * progress
    this.playedTime = selectedTime
    audio?.seek(selectedTime)
    audio?.play()
  }

  async play (): Promise<void> {
    this.audio?.play()
  }

  async pause (): Promise<void> {
    this.audio?.pause()
  }
}
