<template>
  <div
    class="fixed inset-0 bg-pitch bg-opacity-75 transition-opacity overflow-y-auto h-full w-full z-60"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="title"
  >
    <div class="flex justify-center pt-4 px-4 pb-20 text-center sm:(block p-0) xl:min-h-screen ">
      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        class="hidden sm:(inline-block align-middle h-screen)"
        aria-hidden="true"
      />
      <div
        class="inline-block bg-moss rounded text-left overflow-hidden shadow-xl transform transition-al"
        :class="modalBody"
      >
        <div class="bg-moss">
          <on-click-outside @trigger="emitClose">
            <slot />
          </on-click-outside>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'
import { Emit, Prop } from 'vue-property-decorator'

@Options({
  components: { OnClickOutside }
})

export default class ModalPopup extends Vue {
  @Prop({ default: 'modal' }) title!: string
  @Prop({ default: 'sm:(my-8 align-middle max-w-2xl w-full)' }) modalBody!: string
  @Emit() emitClose (): boolean { return false }
}
</script>
