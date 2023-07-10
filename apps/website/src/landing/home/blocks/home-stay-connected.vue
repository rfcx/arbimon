<template>
  <contact-card>
    <div class="flex flex-col gap-2">
      <h2 class="leading-10">
        Stay connected
      </h2>
      <p class="mb-4">
        Be the first to hear the latest from Arbimon.
      </p>
    </div>
    <div>
      <span class="text-sm">Email address</span>
      <form>
        <input
          type="text"
          placeholder="Enter your email"
          class="mr-4 w-1/2 border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
        >
        <button
          class="btn btn-primary"
        >
          Sign up
        </button>
      </form>
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '../components/contact-card.vue'
</script>
