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
  </form>
</template>
<script setup lang="ts">
import { formMainAudience, tagWebsiteSubscriber } from '@/_services/mailchimp'
</script>
