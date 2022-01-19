<template>
  <on-click-outside
    class="relative"
    @trigger="isDropdownOpen = false"
  >
    <button
      class="btn btn-icon"
      @click="isDropdownOpen = !isDropdownOpen"
    >
      <div class="flex items-center">
        <slot name="label">
          <icon-fas-ellipsis-v />
        </slot>
      </div>
    </button>
    <div
      v-if="isDropdownOpen"
      class="w-56 absolute top-10 right-0 text-primary text-md <md:w-max"
    >
      <slot />
    </div>
  </on-click-outside>
</template>
<script lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: { OnClickOutside }
})
export default class DropdownMenu extends Vue {
  isDropdownOpen = false
}
</script>
