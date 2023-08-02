<template>
  <div v-if="currentProject">
    <featured-hero
      :title="currentProject.title"
      :description="currentProject.descriptiveText"
      :image="currentProject.featuredImage"
      :info="currentProject.header"
    />
    <featured-content :content="currentProject.content" />
    <featured-gallery :images="currentProject.gallery?.images ?? []" />
    <featured-feedback :feedbacks="currentProject.feedback" />
    <featured-impact-goal
      title="Impact Goals"
      :text-paragraphs="currentProject.impact?.paragraphs ?? []"
      :cta-text="currentProject.impact?.cta?.text ?? ''"
      :cta-link="currentProject.impact?.cta?.link ?? ''"
      :image="currentProject.impact?.image ?? ''"
    />
    <featured-contact />
    <featured-explorer :projects="projects" />
    <footer-contact />
  </div>
</template>

<script setup lang="ts">
// TODO: handle when currentProject is undefined
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import { projects } from '../featured/data'
import FeaturedContact from './blocks/featured-contact.vue'
import FeaturedContent from './blocks/featured-content.vue'
import FeaturedExplorer from './blocks/featured-explorer.vue'
import FeaturedFeedback from './blocks/featured-feedback.vue'
import FeaturedGallery from './blocks/featured-gallery.vue'
import FeaturedHero from './blocks/featured-hero.vue'
import FeaturedImpactGoal from './blocks/featured-impact-goal.vue'

const currenRoute = useRoute()
const currentProject = computed(() => projects.find(
  (project) => project.category.id === currenRoute.params.slug
))

</script>
