<template>
  <div
    v-if="loading"
    class="mb-4"
  >
    <div>
      <span
        class="inline-block min-h-[1em] w-2/12 text-lg loading-shimmer"
      />
    </div>
    <div>
      <span
        class="inline-block min-h-[1em] w-1/12 text-lg loading-shimmer"
      />
    </div>
  </div>
  <div
    v-else
    class="flex items-center mb-4"
  >
    <div>
      <h3
        class="text-lg"
      >
        {{ species.commonName }}
      </h3>
      <div
        v-if="species.scientificName"
        class="text-subtle italic"
      >
        ({{ species.scientificName }})
      </div>
    </div>
    <el-tag
      v-if="riskInformation"
      class="border-none ml-2"
      effect="dark"
      :color="riskInformation.color"
      :title="riskInformation.label"
    >
      {{ riskInformation.code }}
    </el-tag>
  </div>
</template>
<script lang="ts" src="./species-title.ts"></script>
