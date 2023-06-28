<template>
  <div v-if="currentProject">
    <featured-hero
      :image="currentProject.featuredImage"
      :info="currentProject.header"
    />
    <featured-content :content="currentProject.content" />
    <featured-gallery />
    <featured-feedback :feedbacks="currentProject.feedback" />
    <featured-impact-goal
      title="Impact Goals"
      :text="currentProject.impact?.text ?? ''"
    />
    <featured-explorer :projects="projects" />
  </div>
</template>

<script setup lang="ts">
// TODO: handle when currentProject is undefined
import { useRoute } from 'vue-router'

import { projects } from '../featured/data'
import FeaturedContent from './blocks/featured-content.vue'
import FeaturedExplorer from './blocks/featured-explorer.vue'
import FeaturedFeedback from './blocks/featured-feedback.vue'
import FeaturedGallery from './blocks/featured-gallery.vue'
import FeaturedHero from './blocks/featured-hero.vue'
import FeaturedImpactGoal from './blocks/featured-impact-goal.vue'

const currenRoute = useRoute()
const currentProject = projects.find(
  (project) => project.category.id === currenRoute.params.slug
)

</script>
