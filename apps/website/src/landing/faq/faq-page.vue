<template>
  <section class="bg-white dark:bg-echo">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
      <div class="grid pt-8 text-left gap-10 md:gap-16 dark:border-gray-700 md:grid-cols-2">
        <div>
          <h1 class="mb-8 text-gray-900 dark:text-frequency">
            Frequently Asked Questions
          </h1>
          <p>Questions about Arbimon? Our FAQ page has you covered.</p>
        </div>
        <div
          data-accordion="collapse"
          data-active-classes="dark:bg-moss text-insight border-b-0 border-gray-200 dark:border-gray-700"
          data-inactive-classes="text-insight"
        >
          <template
            v-for="(faq, idx) in faqs"
            :key="faq.question"
          >
            <faq-accordion
              :answer="faq.answer"
              :question="faq.question"
              :item-id="idx"
              :is-answer-opened="faq.isAnswerOpened"
              @toggle-answer="onToggleAnswer"
            />
          </template>
        </div>
      </div>
    </div>
  </section>
  <faq-cta />
  <footer-contact />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import FaqCta from './blocks/faq-cta.vue'
import FaqAccordion from './components/faq-accordion.vue'
import { faqList } from './data'
import { slugify } from './utils'

const faqs = ref<Array<{ question: string, answer: string, isAnswerOpened: boolean }>>(faqList.map(f => {
  const faqWithStatus = {
    question: f.question,
    answer: f.answer,
    isAnswerOpened: false
  }
  return faqWithStatus
}))

const route = useRoute()

onMounted(() => {
  const hash = route.hash
  const questionIndex = faqs.value.findIndex(f => `#${slugify(f.question)}` === hash)

  if (questionIndex === -1) {
    return
  }

  faqs.value[questionIndex].isAnswerOpened = true
})

const onToggleAnswer = (itemId: number): void => {
  faqs.value[itemId].isAnswerOpened = !faqs.value[itemId].isAnswerOpened
}
</script>
