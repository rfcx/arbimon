<template>
  <contact-card>
    <div class="flex flex-col">
      <h1>
        Stay connected
      </h1>
      <p class="my-8">
        Be the first to hear the latest from Arbimon.
      </p>
    </div>
    <div class="flex flex-col lg:flex-row gap-2">
      <form class="flex flex-col md:flex-row gap-2">
        <span class="sr-only">First name</span>
        <input
          type="text"
          placeholder="First name"
          class="inline-flex border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency) md:w-1/3"
        >
        <span class="sr-only">Email address</span>
        <input
          type="text"
          placeholder="Email Address"
          class="border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency) md:w-2/3"
        >
      </form>
      <button
          class="btn btn-primary min-w-1/4 mr-0"
        >
          Sign up
        </button>
    </div>
  </contact-card>
</template>
<script setup lang="ts">
import ContactCard from '../components/contact-card.vue'
</script>
