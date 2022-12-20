<template>
  <div class="ml-0 text-sm">
    <icon-fa-check
      v-if="props.value==='present'"
      class="cursor-pointer h-3 text-sky-300 inline mr-2"
    />
    <icon-fa-close
      v-if="props.value==='not_present'"
      class="cursor-pointer h-3 text-orange-300 inline mr-2"
    />
    <icon-fa-circle
      v-if="props.value==='unknown'"
      class="cursor-pointer text-lime-300 h-3 inline mr-2"
    />
    <icon-fa-circle-thin
      v-if="(props.value==='unvalidated' && props.hideUnvalidated === false)"
      class="cursor-pointer text-gray-300 h-3 inline mr-2"
    />
  </div>
</template>
<script setup lang="ts">

const props = defineProps<{
  value: string,
  hideUnvalidated: boolean
}>()

</script>
