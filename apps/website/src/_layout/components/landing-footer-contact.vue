<template>
  <section class="dark:bg-moss px-4 sm:px-6 lg:px-20 border-t border-t-frequency">
    <div class="max-w-screen-xl mx-auto py-10 gap-8 flex flex-col lg:(flex-row items-center) justify-between">
      <div class="basis-full lg:basis-1/3">
        <h2>Stay connected</h2>
        <p>Be the first to hear the latest from Arbimon.</p>
      </div>
      <div class="basis-full lg:basis-2/3">
        <ContactForm />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import ContactForm from './mailing-list-form.vue'
</script>
