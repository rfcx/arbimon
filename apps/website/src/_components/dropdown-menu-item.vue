<template>
  <button
    :disabled="disabled"
    class="w-full flex justify-start items-center bg-box-gray p-3 first:rounded-t-md last:rounded-b-md select-none disabled:(text-subtle cursor-not-allowed line-through) not-disabled:hover:(bg-box-gray-dark cursor-pointer)"
  >
    <slot />
  </button>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class DropdownMenuItem extends Vue {
  @Prop() disabled!: boolean
}
</script>
