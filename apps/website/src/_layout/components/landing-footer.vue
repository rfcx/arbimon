<template>
  <footer class="px-4 sm:px-6 py-8 lg:pt-24 bg-white dark:bg-pitch">
    <div class="mx-auto max-w-screen-xl">
      <!-- Logo & Socials -->
      <div class="flex justify-between mb-8">
        <div class="mb-6 md:mb-0">
          <router-link
            to="/"
            class="flex items-center"
          >
            <brand-logo />
          </router-link>
        </div>
        <!-- Social media -->
        <div
          class="flex space-x-1 sm:justify-center sm:mt-0"
          aria-label="Follow us on Social Media"
        >
          <a
            href="https://twitter.com/rainforestcx"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="Twitter"
          >
            <img
              class="w-8"
              src="@/_assets/landing/footer/fi_twitter.svg"
            >
          </a>
          <a
            href="https://www.linkedin.com/company/rainforest-connection"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="LinkedIn"
          >
            <img
              class="w-8"
              src="@/_assets/landing/footer/fi_linkedin.svg"
            >
          </a>
          <a
            href="https://www.instagram.com/rainforestcx/"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="Instagram"
          >
            <img
              class="w-8"
              src="@/_assets/landing/footer/fi_instagram.svg"
            >
          </a>
          <a
            href="https://www.facebook.com/RainforestCx/"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="Facebook"
          >
            <img
              class="w-8"
              src="@/_assets/landing/footer/fi_facebook.svg"
            >
          </a>
        </div>
      </div>
      <!-- Links -->
      <div class="md:flex md:justify-between">
        <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
          <div>
            <h3 class="mb-6 text-gray-900 text-sm dark:text-insight">
              Resources
            </h3>
            <ul class="text-gray-600 dark:text-gray-300 text-sm">
              <li class="mb-4">
                <router-link
                  to="/faq"
                  class="hover:underline"
                >
                  FAQs
                </router-link>
              </li>
              <li class="mb-4">
                <a
                  href="https://support.rfcx.org"
                  class="hover:underline"
                >Help &amp; Support</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:underline"
                >Contact us</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="mb-6 text-gray-900 dark:text-insight text-sm">
              Legal
            </h3>
            <ul class="text-gray-600 dark:text-gray-300 text-sm">
              <li class="mb-4">
                <a
                  href="#"
                  class="hover:underline"
                >Privacy Policy</a>
              </li>
              <li>
                <a
                  href="#"
                  class="hover:underline"
                >Terms &amp; Conditions</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 md:mt-0">
          <span class="block mb-4 text-sm text-gray-900 dark:text-insight">In collaboration with</span>
          <span class="sr-only">Rainforest Connection™</span>
          <a
            href="https://rfcx.org/"
          >
            <img
              src="@/_services/assets/rfcx-logo-with-text.svg"
              class="w-40"
              alt="Rainforest Connection™ website"
            >
          </a>
        </div>
      </div>
      <div class="sm:flex sm:items-center sm:justify-between mt-10">
        <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400 font-['Roboto']">© 2023 <a
          href="https://rfcx.org"
          class="hover:underline"
        >Rainforest Connection™</a>
        </span>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
import BrandLogo from './brand-logo.vue'
</script>
