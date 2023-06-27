<template>
  <hero />
  <content subheader="Partnering with the Charles Darwin Foundation, Arbimon is facilitating important work to understand where the Critically Endangered mangrove finch is present using automated detections of their calls." />
  <gallery />
  <feedback :feedbacks="feedbacks" />
</template>

<script setup lang="ts">

import Content from './blocks/content.vue'
import Feedback from './blocks/feedback.vue'
import Gallery from './blocks/gallery.vue'
import Hero from './blocks/hero.vue'

const feedbacks = [
  {
    text: 'Arbimon has revolutionized the way we conduct acoustic research. With its user-friendly interface, we can now easily collect, analyze, and collaborate on biodiversity data to drive meaningful change and protect our planet’s precious ecosystems.',
    partner: {
      name: 'Charles Darwin Foundation'
    }
  }
]

</script>
