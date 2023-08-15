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
          id="accordion-flush"
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
import type { AccordionItem, AccordionOptions } from 'flowbite'
import { Accordion } from 'flowbite'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FooterContact from '@/_layout/components/landing-footer-contact.vue'
import FaqCta from './blocks/faq-cta.vue'
import FaqAccordion from './components/faq-accordion.vue'
import { faqList } from './data'
import { slugify } from './utils'

const faqs = ref(faqList)
const route = useRoute()
const accordions = ref<Accordion | null>(null)

watch(() => route.hash, (newHash) => {
  openAccordion(newHash)
})

onMounted(() => {
  const items: AccordionItem[] = faqList.map((f, i) => {
    const questionSlug = slugify(f.question)

    return {
      id: questionSlug,
      triggerEl: document.querySelector(`#${questionSlug}`) as HTMLElement,
      targetEl: document.querySelector('#accordion-flush-body-' + i) as HTMLElement,
      iconEl: document.querySelector('#accordion-icon-' + i) as HTMLElement,
      active: false
    }
  })

  const options: AccordionOptions = {
      alwaysOpen: false,
      activeClasses: 'dark:bg-moss text-insight border-b-0 border-gray-200 dark:border-gray-700',
      inactiveClasses: 'text-insight'
  }

  accordions.value = new Accordion(items, options)

  // If there's hash on enter page. Navigate to it.
  if (route.hash !== '') {
    // Navigate to the given hash if the hash matches one of the headings.
    if (items.find(i => `#${i.id}` === route.hash) != null) {
      openAccordion(route.hash)
    }
  }
})

/**
 * Open the accordion depends on the hash, close all other accordions.
 */
const openAccordion = (newHash: string): void => {
  if (newHash.length === 0) {
    return
  }

  if (accordions.value == null) {
    return
  }

  // Get all other faqs that is not the one we're trying to go, and close all of them.
  faqList.filter(f => {
      return `#${slugify(f.question)}` !== newHash
    })
    .forEach(f => {
      accordions.value?.close(slugify(f.question))
    })

  accordions.value?.open(newHash.slice(1))
}
</script>
