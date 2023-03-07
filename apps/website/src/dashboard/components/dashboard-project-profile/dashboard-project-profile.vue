<template>
  <div v-if="loading">
    <span
      class="inline-block min-h-[1em] w-5/12 loading-shimmer"
    />
    <span
      class="inline-block min-h-[1em] w-9/12 loading-shimmer"
    />
    <span
      class="inline-block min-h-[1em] w-4/12 loading-shimmer"
    />
  </div>
  <markdown
    v-else
    :source="information"
    class="markdown-container"
  />
</template>
<script lang="ts" src="./dashboard-project-profile.ts"></script>
<style lang="scss">
.markdown-container {
  h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  h2:not(:first-child) {
    margin-top: 1.25rem;
  }
  p {
    margin-top: 0.75rem;
  }
  ul {
    list-style-type: square;
    margin-left: 1.25rem;
  }
  a:hover {
    -webkit-text-decoration-line: underline;
    text-decoration-line: underline;
  }
}
</style>
