<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="flex flex-row items-center gap-16">
        <div class="basis-3/5">
          <div v-if="isSubmitted">
            <div
              class="flex p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
              role="alert"
            >
              <svg
                aria-hidden="true"
                class="flex-shrink-0 inline w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              ><path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              /></svg>
              <span class="sr-only">Info</span>
              <div>
                <span class="font-medium">Submitted!</span> Thank you for contacting us.
              </div>
            </div>
          </div>
          <form
            v-else
            action="https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8"
            method="POST"
            class="p-8 space-y-8"
          >
            <div class="grid grid-cols-2 gap-8">
              <div>
                <label
                  for="name"
                  class="block mb-2 font-bold text-gray-300 dark:text-insight"
                >Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  maxlength="80"
                  class="bg-gray-700 border border-gray-600 text-white rounded-lg block w-full p-2.5 dark:bg-gray-50 dark:border-gray-300 dark:placeholder-gray-300 dark:text-gray-900"
                  placeholder="David Attenborough"
                  required
                >
              </div>
              <div>
                <label
                  for="email"
                  class="block mb-2 font-bold text-gray-300 dark:text-insight"
                >Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxlength="80"
                  class="bg-gray-700 border border-gray-600 text-white rounded-lg block w-full p-2.5 dark:bg-gray-50 dark:border-gray-300 dark:placeholder-gray-300 dark:text-gray-900"
                  placeholder="david@arbimon.org"
                  required
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-8">
              <div>
                <label
                  for="phone"
                  class="block mb-2 font-bold text-gray-300 dark:text-insight"
                >Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  maxlength="40"
                  class="bg-gray-700 border border-gray-600 text-white rounded-lg block w-full p-2.5 dark:bg-gray-50 dark:border-gray-300 dark:placeholder-gray-300 dark:text-gray-900"
                  placeholder="+1 (123) 456-789"
                >
              </div>
              <div>
                <label
                  for="company"
                  class="block mb-2 font-bold text-gray-300 dark:text-insight"
                >Organization</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  maxlength="80"
                  class="bg-gray-700 border border-gray-600 text-white rounded-lg block w-full p-2.5 dark:bg-gray-50 dark:border-gray-300 dark:placeholder-gray-300 dark:text-gray-900"
                  placeholder="Arbimon"
                >
              </div>
            </div>
            <div>
              <label
                for="subject"
                class="block mb-2 font-bold text-gray-300 dark:text-insight"
              >Type of inquiry</label>
              <select
                id="subject"
                name="subject"
                class="bg-gray-700 border border-gray-600 text-white rounded-lg block w-full p-2.5 dark:bg-gray-50 dark:border-gray-300 dark:placeholder-gray-300 dark:text-gray-900"
                required
              >
                <option>Request for partnership</option>
                <option>Arbimon question</option>
                <option>Other</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label
                for="message"
                class="block mb-2 font-bold text-gray-300 dark:text-insight"
              >Message</label>
              <textarea
                id="message"
                name="description"
                rows="6"
                class="text-base bg-gray-700 border border-gray-600 text-white rounded-lg block w-full p-2.5 dark:bg-gray-50 dark:border-gray-300 dark:placeholder-gray-300 dark:text-gray-900"
                placeholder="Reach out to us, ask a question or leave a comment..."
              />
            </div>
            <div>
              <input
                type="hidden"
                name="orgid"
                value="00D36000000uBYX"
              >
              <input
                type="hidden"
                name="retURL"
                :value="returnUrl"
              >
              <input
                v-if="isTestForm"
                type="hidden"
                name="debug"
                value="1"
              >
              <input
                v-if="isTestForm"
                type="hidden"
                name="debugEmail"
                value="bourhan@rfcx.org"
              >
              <button
                type="submit"
                class="btn btn-primary"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
        <div class="basis-2/5 text-gray-500 dark:text-gray-400">
          <h2 class="mb-4 text-sm">
            CONTACT US
          </h2>
          <h3 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            Get in touch today
          </h3>
          <p class="mb-16 font-light sm:text-xl">
            Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
          </p>
          <p class="mb-4">
            contact@arbimon.org
          </p>
          <p class="mb-4">
            +1 (415) 792-9472
          </p>
          <p class="mb-4">
            440 Cobia Drive, Suite 1902,<br>Katy, TX, 77494, USA
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const isTestForm = import.meta.env.DEV
const returnUrl = typeof window !== 'undefined' ? window.location.origin + '?submitted=true' : ''
const isSubmitted = route.query.submitted === 'true'
</script>
