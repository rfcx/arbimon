<template>
  <div v-if="currentProject">
    <hero
      :image="currentProject.featuredImage"
      :info="currentProject.header"
    />
    <content :content="currentProject.content" />
    <gallery />
    <feedback :feedbacks="currentProject.feedback" />
  </div>
</template>

<script setup lang="ts">
// TODO: handle when currentProject is undefined
import { useRoute } from 'vue-router'

import { projects } from '../featured/data'
import Content from './blocks/content.vue'
import Feedback from './blocks/feedback.vue'
import Gallery from './blocks/gallery.vue'
import Hero from './blocks/hero.vue'

const currenRoute = useRoute()
const currentProject = projects.find(
  (project) => project.category.id === currenRoute.params.slug
)

</script>
