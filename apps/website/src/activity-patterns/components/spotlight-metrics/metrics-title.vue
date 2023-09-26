<template>
  <div class="flex flex-row items-center group relative">
    <div class="capitalize text-xl text-subtle mr-2">
      {{ title }}
    </div>
    <div class="text-subtle hover:cursor-pointer focus:cursor-pointer">
      <icon-fa-info-circle />
    </div>
    <p
      class="absolute min-w-70 -top-20 z-10 mx-auto bg-box-grey mt-2 py-2 px-4 invisible whitespace-pre-wrap group-hover:visible rounded-md"
    >
      {{ information }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string, information: string }>(), {
  information: undefined
})
</script>
