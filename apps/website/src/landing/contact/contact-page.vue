<template>
  <section class="bg-white dark:bg-pitch mx-6 my-10 lg:(my-30 mx-20)">
    <div class="mx-auto max-w-screen-xl rounded-2xl border-1 border-frequency">
      <div class="flex flex-col items-center lg:(flex-row-reverse)">
        <div class="bg-hero-contact basis-2/5 flex flex-1 self-stretch border-b-1 border-l-0 rounded-t-2xl rounded-r-none border-b-frequency text-gray-500 dark:text-insight lg:(flex-col border-l-1 border-b-0 border-l-frequency rounded-t-none rounded-r-2xl)">
          <div class="flex-1 bg-black bg-opacity-50 p-10 flex flex-col sm:flex-row gap-10 justify-between rounded-t-2xl rounded-r-none lg:(flex-col rounded-t-none rounded-r-2xl px-10 pt-20 pb-64)">
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
                +1 (325) 666-3050
              </p>
              <h3 class="uppercase mb-1 font-medium">
                Address
              </h3>
              <p class="mb-4">
                77 Van Ness Avenue, Suite 101-1717,<br> San Francisco CA, 94102, USA
              </p>
            </div>
          </div>
        </div>
        <div class="basis-3/5 w-full">
          <form
            action="https://api.web3forms.com/submit"
            method="POST"
            class="space-y-8 p-10 dark:bg-echo rounded-l-2xl bg-gradient-to-br from-bg-moss to-bg-transparent"
          >
            <input
              type="hidden"
              name="access_key"
              value="6b662a35-0da1-4d47-b669-4375c564cc93"
            >
            <div v-if="isSubmitted">
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
                  class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
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
                  class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
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
                  class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
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
                  class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
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
                class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
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
                class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
              >Type of inquiry <span class="text-sm font-normal">(required)</span></label>
              <select
                id="inquiry_type"
                v-model="inquiryType"
                name="Inquiry Type"
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
            <div v-if="isSupportType">
              <label
                for="product_name"
                class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
              >Product <span class="text-sm font-normal">(required)</span></label>
              <select
                id="product_name"
                v-model="productName"
                class="w-full p-2 border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                required
              >
                <option value="Companion app">
                  Companion app
                </option>
                <option value="Uploader app">
                  Uploader app
                </option>
                <option value="Explore & Manage Data (i.e. Sites, Recordings, Species, Playlist)">
                  Explore & Manage Data (i.e. Sites, Recordings, Species, Playlist)
                </option>
                <option value="Visualizer">
                  Visualizer
                </option>
                <option value="Audio Analyses (PM, RFM, AED-C, Soundscape)">
                  Audio Analyses (PM, RFM, AED-C, Soundscape)
                </option>
                <option value="Ecological Insights">
                  Ecological Insights
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>
            <div
              v-if="isSupportType"
              class="col-span-2"
            >
              <label
                for="url"
                class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
              >Link to project
                <span class="text-sm font-normal">(required)</span>
              </label>
              <input
                id="url"
                v-model="url"
                type="text"
                class="w-full border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                placeholder="URL of the project/page you’d like support with"
                required
              >
            </div>
            <div v-if="!isSupportType">
              <label
                for="referral_source"
                class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
              >How did you hear about us? <span class="text-sm font-normal">(required)</span></label>
              <select
                id="referral_source"
                name="00NEZ000000OYOb"
                class="w-full p-2 border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency)"
                :required="!isSupportType"
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
                class="block mb-2 font-medium text-util-gray-01 dark:text-insight"
              >Message <span class="text-sm font-normal">(required)</span></label>
              <textarea
                id="message"
                v-model="message"
                rows="6"
                class="p-2 w-full text-base border border-cloud rounded-md dark:(bg-pitch text-insight placeholder:text-insight) focus:(border-frequency ring-frequency) placeholder-gray-500"
                placeholder="Reach out to us, ask a question or leave a comment..."
                required
              />
            </div>
            <div class="text-right">
              <input
                type="hidden"
                name="description"
                :value="description"
              >
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
                name="redirect"
                :value="returnUrl"
              >
              <button
                type="submit"
                class="btn btn-primary jusify-end"
              >
                Send us a message
              </button>
              <div
                v-if="isError"
                class="mt-2"
              >
                <p class="text-xs text-flamingo">
                  <span class="font-medium">
                    A Server Error Occurred.
                  </span>
                  We encountered some issues while deleting the member. <br>
                  Could you please try again?
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
  <footer-contact />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import FooterContact from '@/_layout/components/landing-footer-contact.vue'

const route = useRoute()

const firstName = ref('')
const lastName = ref('')
const inquiryType = ref('Collaboration')
const productName = ref('Companion app')
const message = ref('')
const url = ref('')

const returnUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://arbimon.org') + '/contact?submitted=true'
const isSubmitted = route.query.submitted === 'true'

const isSupportType = computed(() => {
  return inquiryType.value === 'Support'
})

const description = computed(() => {
  if (isSupportType.value) {
    return `
      [product name]: ${productName.value}
      [url]: ${url.value}
      [message]: ${message.value}
    `
  } else {
    return message.value
  }
})

const isError = ref(false)

</script>
