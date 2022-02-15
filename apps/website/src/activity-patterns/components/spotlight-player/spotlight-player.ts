import { Howl } from 'howler'
import { Options, Vue } from 'vue-class-component'
import { Inject, Prop, Watch } from 'vue-property-decorator'

import { coreMediaUrl } from '@rfcx-bio/common/api-bio/media/core-media'
import { SpeciesCall } from '@rfcx-bio/common/api-bio/species/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { assetsService } from '@/activity-patterns/services'
import { BiodiversityStore } from '~/store'
import AudioController from './audio-controller.vue'

type ScrollDirection = 'left' | 'right'

const SCROLL_STEP = 150

@Options({
  components: {
    AudioController
  }
})
export default class SpotlightPlayer extends Vue {
  @Inject() readonly store!: BiodiversityStore
  @Prop() speciesCalls!: SpeciesCall[]

  loading = false

  spectrograms: string[] = []
  audioList: Howl[] = []
  audio: Howl | null = null
  playing = false
  playingAudioIndex = -1
  playedTime = 0
  playedProgressPercentage = 0

  get isEmpty (): boolean {
    return this.speciesCalls.length === 0
  }

  get displayPlayedTime (): string {
    return `${dayjs.duration(this.playedTime, 'seconds').format('m:ss')}`
  }

  override async created (): Promise<void> {
    await this.getSpeciesCallAssets()
  }

  @Watch('speciesCalls')
  async onSpeciesCallChange (): Promise<void> {
    await this.getSpeciesCallAssets()
  }

  async getSpeciesCallAssets (): Promise<void> {
    this.loading = true
    await Promise.all([
      this.getSpectrogramImage()
    ])
    this.getAudio()
    this.loading = false
  }

  async getSpectrogramImage (): Promise<void> {
    const spectrogramList = (await Promise.all(this.speciesCalls.map(async ({ mediaSpecUrl }) => await assetsService.getMedia(mediaSpecUrl)))).filter(isDefined)
    this.spectrograms = spectrogramList.map(data => window.URL.createObjectURL(data))
  }

  getAudio (): void {
    this.audioList = this.speciesCalls.map(({ mediaWavUrl }) => {
      return new Howl({
        src: [`${import.meta.env.VITE_BIO_API_BASE_URL}${coreMediaUrl()}?url=${mediaWavUrl}`],
        html5: true,
        xhr: {
          method: 'POST'
        },
        onend: () => {
          this.playing = false
          this.playingAudioIndex = -1
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
    })
    this.audio = this.audioList.length > 0 ? this.audioList[0] : null
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

  async setAudioIndex (idx: number): Promise<void> {
    this.playingAudioIndex = idx
    this.audio = this.audioList[idx]
    if (this.playing) {
      await this.pause()
    } else {
      await this.play()
    }
  }

  async play (): Promise<void> {
    this.audio?.play()
  }

  async pause (): Promise<void> {
    this.audio?.pause()
  }

  scrollContent (direction: ScrollDirection = 'left'): void {
    const content = document.querySelector('#spectrogram-container')
    if (!content) return

    if (direction === 'left') {
      content.scrollLeft -= SCROLL_STEP
    } else {
      content.scrollLeft += SCROLL_STEP
    }
  }
}
