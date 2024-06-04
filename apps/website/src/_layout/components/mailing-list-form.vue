<template>
  <form
    :action="formMainAudience"
    method="post"
    target="_blank"
    class="flex flex-col lg:flex-row gap-4 justify-end items-stretch flex-wrap"
  >
    <div class="flex-1">
      <div class="sr-only">
        First name
      </div>
      <input
        required
        type="text"
        name="FNAME"
        placeholder="First name"
        oninvalid="setCustomValidity('Please enter your first name')"
        oninput="setCustomValidity('')"
        class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
      >
    </div>
    <div class="flex-1">
      <div class="sr-only">
        Email address
      </div>
      <input
        required
        type="text"
        name="EMAIL"
        placeholder="Email address"
        oninvalid="this.setCustomValidity('Please enter your email')"
        oninput="setCustomValidity('')"
        class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
      >
    </div>
    <input
      type="hidden"
      name="tags"
      :value="tagWebsiteSubscriber"
    >
    <button
      type="submit"
      class="btn btn-primary h-10 mr-0 py-0 grow-0"
    >
      Subscribe
    </button>
    <div
      v-if="hasError"
      class="mt-2 text-left items-center"
    >
      <p class="text-xs text-flamingo">
        <span class="font-medium">
          A Server Error Occurred.
        </span>
        We encountered some issues while deleting the member. Could you please try again?
      </p>
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { formMainAudience, tagWebsiteSubscriber } from '@/_services/mailchimp'

const form = document.querySelector('form')
const hasError = ref(false)

if (form instanceof HTMLFormElement) {
  hasError.value = false
  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault()
      hasError.value = true
    }
  })
}

</script>
