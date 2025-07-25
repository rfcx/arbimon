<template>
  <div class="absolute top-full mt-2 z-50 bg-moss border-0 text-white rounded-lg p-4 w-[400px] space-y-4 border border-util-gray-03 shadow-lg">
    <div>
      <h3 class="block text-sm mb-1">
        Recording fields
      </h3>
      <input
        placeholder="Filename, Site, ..."
        class="input-style"
      >
    </div>

    <div>
      <label class="block text-sm mb-1">Validations by species/song type</label>
      <input
        placeholder="Species - Sound..."
        class="input-style"
      >
    </div>

    <div>
      <label class="block text-sm mb-1">Soundscape Composition</label>
      <input
        placeholder="Wind, Birds, ..."
        class="input-style"
      >
    </div>

    <div>
      <label class="block text-sm mb-1">Tags</label>
      <input
        placeholder="Tags..."
        class="input-style"
      >
    </div>

    <div>
      <label class="block text-sm mb-1">Grouping of Detections</label>
      <select class="input-style">
        <option
          disabled
          selected
          value=""
        >
          Select group...
        </option>
        <option>Group A</option>
        <option>Group B</option>
      </select>
    </div>

    <div>
      <label class="block text-sm mb-1">Species detection matrix</label>
      <input
        placeholder="Select species..."
        class="input-style"
      >
    </div>

    <div class="flex justify-between mt-4">
      <button class="btn btn-secondary  btn-small w-full items-center justify-center inline-flex hover:text-pitch mr-1">
        <icon-fa-undo class="h-3 w-3 mr-1" />
        Reset
      </button>
      <button class="btn btn-primary btn-small w-full items-center justify-center inline-flex ml-1">
        <icon-fa-send-o class="h-3 w-3 mr-1" />
        Export Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// logic
</script>

<style lang="scss">
.input-style {
  @apply bg-echo text-insight w-full rounded px-3 py-2 text-sm placeholder-insight border border-util-gray-03;
}
</style>
