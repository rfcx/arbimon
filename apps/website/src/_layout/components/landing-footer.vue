<template>
  <footer class="px-4 sm:px-6 py-8 lg:(pt-6 px-20) bg-white dark:bg-pitch">
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
            href="https://twitter.com/ARBlMON"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="Twitter"
          >
            <img
              class="w-8 p-2"
              src="@/_assets/landing/footer/fi_twitter.svg"
            >
          </a>
          <a
            href="https://www.linkedin.com/company/arbimon/"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="LinkedIn"
          >
            <img
              class="w-8"
              src="@/_assets/landing/footer/fi_linkedin.svg"
            >
          </a>
          <a
            href="https://www.instagram.com/arbimon/"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            aria-label="Instagram"
          >
            <img
              class="w-8"
              src="@/_assets/landing/footer/fi_instagram.svg"
            >
          </a>
          <a
            href="https://www.facebook.com/ARBIMON"
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
            <h6 class="mb-6 text-gray-900 dark:text-insight font-medium text-base">
              Resources
            </h6>
            <ul class="text-gray-600 dark:text-util-gray-01">
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
                  href="https://help.arbimon.org/"
                  class="hover:underline"
                >Help &amp; Support</a>
              </li>
              <li class="mb-4">
                <router-link
                  to="/contact"
                  class="hover:underline"
                >
                  Contact us
                </router-link>
              </li>
              <li>
                <a
                  href="http://status.rfcx.org/"
                  class="hover:underline"
                >System status</a>
              </li>
            </ul>
          </div>
          <div>
            <h6 class="mb-6 text-gray-900 dark:text-insight font-medium text-base">
              Legal
            </h6>
            <ul class="text-gray-600 dark:text-util-gray-01">
              <li class="mb-4">
                <a
                  href="https://rfcx.org/privacy-policy"
                  class="hover:underline"
                >Privacy Policy</a>
              </li>
              <li>
                <a
                  href="https://rfcx.org/terms-of-service"
                  class="hover:underline"
                >Terms &amp; Conditions</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 md:mt-0">
          <span class="block mb-4 text-gray-900 dark:text-insight text-base font-medium">An initiative by</span>
          <span class="sr-only">Rainforest Connection™</span>
          <a
            href="https://rfcx.org/"
          >
            <img
              src="@/_services/assets/rfcx-logo-with-text.svg"
              class="w-52"
              alt="Rainforest Connection™ website"
            >
          </a>
        </div>
      </div>
      <div class="sm:flex sm:items-center sm:justify-between mt-10 py-4">
        <span class="text-util-gray-02 text-xs sm:text-center font-eyebrow">© {{ new Date().getFullYear() }} <a
          href="https://rfcx.org"
          class="hover:underline font-eyebrow"
        >Rainforest Connection™</a>
        </span>
      </div>
    </div>
  </footer>
</template>
<script setup lang="ts">
import BrandLogo from './brand-logo.vue'
</script>
