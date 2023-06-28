<template>
  <section class="bg-white dark:bg-pitch">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-24 lg:px-6">
      <div class="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
        <span class="text-sm text-spoonbill mb-4 uppercase font-eyebrow">END-TO-END WORKFLOW</span>
        <h2 class="my-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Intuitive & powerful features
        </h2>
      </div>
      <div class="text-center space-y-8 grid grid-cols-2 lg:grid-cols-3 gap-12 space-y-0">
        <div
          v-for="(item, index) in config"
          :key="index"
          class="flex flex-col items-left justify-start"
        >
          <div class="flex justify-start align-start mb-2 w-12 h-12 lg:h-18 lg:w-18">
            <img :src="item.icon">
          </div>
          <h3 class="mb-2 text-lg font-medium dark:text-insight text-left">
            {{ item.title }}
          </h3>
          <p class="max-w-72 text-gray-500 dark:text-insight text-left">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">

import iconCloud from '@/_assets/landing/featured/fi_cloud.svg'
import iconDollar from '@/_assets/landing/featured/fi_dollar-sign.svg'
import iconHardDrive from '@/_assets/landing/featured/fi_hard-drive.svg'
import iconInsight from '@/_assets/landing/featured/fi_insight.svg'
import iconSettings from '@/_assets/landing/featured/fi_settings.svg'
import iconUser from '@/_assets/landing/featured/fi_users.svg'

const config = [
  {
    title: 'Powerful AI algorithms',
    description: 'Supercharge your biodiversity research with Arbimon’s advanced AI algorithms',
    icon: iconSettings
  },
  {
    title: 'Unlimited data storage',
    description: 'Upload, save, aand organize your recordings efficiently and without storage limits',
    icon: iconHardDrive
  },
  {
    title: 'Free',
    description: 'We`re connecting research and action, and our platform is free to advance this mission',
    icon: iconDollar
  },
  {
    title: 'Unlimited users',
    description: 'Collaborate with ease using Arbimon’s multi-user compatibility features',
    icon: iconUser
  },
  {
    title: 'Cloud computing',
    description: 'Capitalize on the power of AI & cloud computing through our web-based platform',
    icon: iconCloud
  },
  {
    title: 'Automated insights',
    description: 'Visualize, interpret, and share your data and biodiversity insights seamlessly',
    icon: iconInsight
  }
]

</script>
