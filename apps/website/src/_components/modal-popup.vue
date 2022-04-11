<template>
  <div
    class="fixed inset-0 z-10 bg-mirage-grey bg-opacity-75 transition-opacity overflow-y-auto h-full w-full z-60"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="title"
  >
    <div class="flex justify-center xl:min-h-screen pt-4 px-4 pb-20 text-center sm:(block p-0)">
      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
      />
      <div class="inline-block bg-steel-grey rounded text-left overflow-hidden shadow-xl transform transition-al w-xs sm:(my-8 align-middle max-w-2xl w-full)">
        <div class="bg-steel-grey">
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
  @Emit() emitClose (): boolean { return false }
  // TODO: #694 change this to better name
  @Prop({ default: 'modal' }) title!: string
}
</script>
