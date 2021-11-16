<template>
  <div class="col-span-3 pr-6">
    <p>
      <span
        v-if="!content"
        class="italic"
      >
        Information not found.
      </span>
      {{ content }}
      <span class="mt-2 text-right text-subtle">
        &mdash; <a
          :href="redirectUrl"
          target="_blank"
          class="opacity-80 hover:(underline opacity-70)"
        >
          Source: {{ source }}
        </a>
      </span>
    </p>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class SpeciesInformationContentComponent extends Vue {
  @Prop() content!: string
  @Prop() redirectUrl!: string
  @Prop() source!: string
}
</script>
