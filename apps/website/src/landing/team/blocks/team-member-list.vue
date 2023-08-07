<template>
  <section class="bg-white dark:bg-pitch px-6 lg:px-10">
    <div class="py-10 mx-auto max-w-screen-xl text-center sm:py-30">
      <div class="mb-10 lg:mb-20">
        <h1 class="mb-6 text-gray-900 dark:text-frequency">
          Meet our science team
        </h1>
        <h4 class="text-gray-500 dark:text-insight">
          Our team is comprised of leaders in the field from expert biologists, ecologists, data scientists and even some of the top birders of Brazil!
        </h4>
      </div>
      <div class="grid md:grid-cols-2 gap-4 lg:(grid-cols-3 gap-6) xl:(grid-cols-4 gap-10) items-stretch">
        <team-card
          image-url="/src/_assets/landing/team/marconi.webp"
          name="Marconi Campos"
          role="Chief Scientist"
          bio="With +20 years of experience in biodiversity monitoring, I strive to integrate tech, AI, and ecological modeling into a global automated remote biodiversity monitoring network that will revolutionize conservation. Traveler, yogi, & birder."
        />
        <quote-card
          title="6"
          subtitle="PhDs"
        />
        <team-card
          image-url="/src/_assets/landing/team/kris.webp"
          name="Kris Harmon"
          role="Biodiversity Scientist"
          bio="Biologist & GIS analyst with a MS in Conservation Ecology, interested in applying passive monitoring to understanding patterns and drivers of biodiversity. Surfer, backpacker, rock climber, fieldwork stalwart, & happiest while exploring."
        />
        <team-card
          image-url="/src/_assets/landing/team/jose.jpg"
          name="José Ribeiro Jr"
          role="Quantitative Ecologist"
          bio="Biologist passionate about unraveling biodiversity's spatial & temporal patterns. I hold an M.Sc. & Ph.D. in Ecology. Soccer is my heart's sport. On weekends, I cherish scenic drives in my old Volkswagen Beetle, enjoying nature's beauty."
        />
        <team-card
          image-url="/src/_assets/landing/team/tomaz.webp"
          name="Tomaz Melo"
          role="Biodiversity Scientist"
          bio="Biologist & ornithologist, with a master's degree in Ecology and a PhD in Zoology, and a passion for photography. My goal is to expand my knowledge about the species that occur in each project to help build better IA models."
        />
        <team-card
          image-url="/src/_assets/landing/team/nelson.webp"
          name="Nelson Buainain"
          role="Data Scientist"
          bio="Passionate biologist & Data Scientist with a PhD in Ecology & Evolution. Protecting biodiversity by developing AI for forest monitoring. Wandering in my VW bus, I seek wilderness, rocks to climb, and delight in bird songs & guitar strings."
        />
        <quote-card
          title="Top 2 eBirders of Brazil."
        />
        <team-card
          image-url="/src/_assets/landing/team/gabriel-le.webp"
          name="Gabriel Leite"
          role="Biodiversity Scientist"
          bio="Biologist & ornithologist with a PhD in Conservation. I live in Manaus and have been working with bioacoustics for many years. I like to travel and record species song. I have more than 2700 species recorded in more than 25 countries."
        />
        <quote-card
          title="50+"
          subtitle="collective years of experience in bioacoustic."
        />
        <team-card
          image-url="/src/_assets/landing/team/carly.webp"
          name="Carly Batist"
          role="Science Outreach Coordinator"
          bio="Primatologist & bioacoustician passionate about science communication, translating acoustic monitoring into conservation insights, & lemurs (study species for my PhD). I love hiking, my fur babies & cheering on Arsenal, the Giants & Knicks."
        />
        <team-card
          image-url="/src/_assets/landing/team/gabriel-mc.webp"
          name="Gabriel McCrate"
          role="Data Analyst"
          bio="MSc in Biological Sciences from Londrina State University & an MSc in Ecology from the National Institute of Amazonian Research. I’m passionate about protecting the rainforests, hikes, wildlife, and homebrews. Sir Attenborough's #1 fan."
        />
        <quote-card
          title="76"
          subtitle="publications in academic journals."
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import quoteCard from '../components/quote-card.vue'
import teamCard from '../components/team-card.vue'
</script>
