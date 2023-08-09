<template>
  <section class="bg-white dark:bg-echo mx-6 my-10 lg:(my-30 mx-20)">
    <div class="mx-auto max-w-screen-xl rounded-xl border-1 border-frequency">
      <div class="flex flex-col items-center lg:(flex-row-reverse)">
        <div class="bg-hero-contact basis-2/5 flex flex-1 self-stretch border-b-1 border-l-0 rounded-t-xl rounded-r-none border-b-frequency text-gray-500 dark:text-insight lg:(flex-col border-l-1 border-b-0 border-l-frequency rounded-t-none rounded-r-xl)">
          <div class="flex-1 bg-black bg-opacity-50 p-10 flex flex-col sm:flex-row gap-10 justify-between rounded-t-xl rounded-r-none lg:(flex-col rounded-t-none rounded-r-xl px-10 pt-20 pb-64)">
            <div>
              <h1 class="mb-4 lg:mb-10 text-gray-900 dark:text-insight">
                Contact us
              </h1>
              <p>We're great listeners.</p>
            </div>
            <div>
              <h3 class="uppercase mb-1 font-medium">
                Email
              </h3>
              <p class="mb-4">
                contact@arbimon.org
              </p>
              <h3 class="uppercase mb-1 font-medium">
                Phone
              </h3>
              <p class="mb-4">
                +1 (415) 792-9472
              </p>
              <h3 class="uppercase mb-1 font-medium">
                Address
              </h3>
              <p class="mb-4">
                440 Cobia Drive, Suite 1902,<br>Katy, TX, 77494, USA
              </p>
            </div>
          </div>
        </div>
        <div class="basis-3/5 w-full">
          <form
            action="https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8"
            method="POST"
            class="space-y-8 p-10 bg-gradient-to-br from-bg-moss to-bg-transparent"
          >
            <div v-if="!isSubmitted">
              <div
                class="flex text-chirp"
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
            <div
              v-else
              class="uppercase col-span-2 font-eyebrow text-spoonbill"
            >
              SEND US A MESSAGE
            </div>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <label
                  for="firstname"
                  class="block mb-2 font-medium text-gray-300 dark:text-insight"
                >First name <span class="text-sm font-normal">(required)</span></label>
                <input
                  id="firstname"
                  v-model="firstName"
                  name="firstname"
                  type="text"
                  maxlength="80"
                  class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                  placeholder="David"
                  required
                >
              </div>
              <div>
                <label
                  for="lastname"
                  class="block mb-2 font-medium text-gray-300 dark:text-insight"
                >Last name</label>
                <input
                  id="lastname"
                  v-model="lastName"
                  name="lastname"
                  type="text"
                  maxlength="80"
                  class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                  placeholder="Attenborough"
                >
              </div>
            </div>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <label
                  for="phone"
                  class="block mb-2 font-medium text-gray-300 dark:text-insight"
                >Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  maxlength="40"
                  class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                  placeholder="+1 (123) 456-789"
                >
              </div>
              <div>
                <label
                  for="email"
                  class="block mb-2 font-medium text-gray-300 dark:text-insight"
                >Email <span class="text-sm font-normal">(required)</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxlength="80"
                  class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                  placeholder="david@arbimon.org"
                  required
                >
              </div>
            </div>
            <div class="col-span-2">
              <label
                for="company"
                class="block mb-2 font-medium text-gray-300 dark:text-insight"
              >Organization</label>
              <input
                id="company"
                name="company"
                type="text"
                maxlength="80"
                class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                placeholder="Arbimon"
              >
            </div>
            <div>
              <label
                for="inquiry_type"
                class="block mb-2 font-medium text-gray-300 dark:text-insight"
              >Type of inquiry <span class="text-sm font-normal">(required)</span></label>
              <select
                id="inquiry_type"
                name="00NEZ000000OYOW"
                class="w-full p-2 border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                required
              >
                <option value="Collaboration">
                  Collaboration
                </option>
                <option value="Support">
                  Support
                </option>
                <option value="Press/media">
                  Press/media
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>
            <div>
              <label
                for="referral_source"
                class="block mb-2 font-medium text-gray-300 dark:text-insight"
              >How did you hear about us? <span class="text-sm font-normal">(required)</span></label>
              <select
                id="referral_source"
                name="00NEZ000000OYOb"
                class="w-full p-2 border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                required
              >
                <option value="Instagram">
                  Instagram
                </option>
                <option value="Facebook">
                  Facebook
                </option>
                <option value="LinkedIn">
                  LinkedIn
                </option>
                <option value="X">
                  X (previously Twitter)
                </option>
                <option value="TikTok">
                  TikTok
                </option>
                <option value="Youtube">
                  Youtube
                </option>
                <option value="Event">
                  Event
                </option>
                <option value="Article">
                  Article
                </option>
                <option value="Friend/Family">
                  Friend/Family
                </option>
                <option value="Web search">
                  Web search
                </option>
                <option value="Email">
                  Email
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label
                for="message"
                class="block mb-2 font-medium text-gray-300 dark:text-insight"
              >Message <span class="text-sm font-normal">(required)</span></label>
              <textarea
                id="message"
                name="description"
                rows="6"
                class="p-2 w-full text-base border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                placeholder="Reach out to us, ask a question or leave a comment..."
              />
            </div>
            <div class="text-right">
              <input
                type="hidden"
                name="name"
                :value="lastName ? firstName + ' ' + lastName : firstName"
              >
              <input
                type="hidden"
                name="subject"
                value="Arbimon Contact Form"
              >
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
                class="btn btn-primary jusify-end"
              >
                Send us a message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const firstName = ref('')
const lastName = ref('')

const isTestForm = import.meta.env.DEV
const returnUrl = typeof window !== 'undefined' ? window.location.origin + '?submitted=true' : ''
const isSubmitted = route.query.submitted === 'true'
</script>
