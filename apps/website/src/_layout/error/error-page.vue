<template>
  <div>
    <navbar />
    <div class="text-fog p-10 lg:p-20 mx-auto text-center">
      <div v-if="route.query.error && route.query.error.includes('Email verification')">
        <p class="text-xl text-gray-900 dark:text-insight font-header">
          {{ route.query.error }}
        </p>
        <p>
          You should have received a verification email in your inbox. If you do not receive one, please contact <a
            class="text-frequency text-underline"
            href="mailto:support@rfcx.org"
          >support@rfcx.org</a>.
        </p>
      </div>
      <p v-else-if="route.query.error">
        {{ route.query.error }}
      </p>
      <div v-else>
        <h2 class="text-gray-900 dark:text-insight">
          404 - Page not found
        </h2>
        <p class="my-4">
          The page you were looking for was not found.
        </p>
        <button class="btn btn-secondary py-2">
          <router-link :to="{ name: ROUTE_NAMES.landingHome }">
            Return to homepage
          </router-link>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

import Navbar from '@/_layout/components/landing-navbar/landing-navbar.vue'
import { ROUTE_NAMES } from '~/router'

const route = useRoute()
</script>
