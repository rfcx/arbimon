<template>
  <section class="bg-hero-testimonial bg-center bg-cover">
    <div>
      <div class="max-w-screen-xl mx-auto py-10 md:py-20 lg:py-30 px-4 lg:px-10 flex flex-col lg:flex-row gap-20">
        <div class="basis-5/12">
          <h1 class="text-frequency mb-4">
            Our purpose
          </h1>
          <div class="text-base lg:text-lg">
            <p class="pb-3 last:pb-0">
              We aim to safeguard and nurture Earth's ecosystems for every creature that calls it home. By harnessing the power of sound, we unlock a deeper understanding of biodiversity, vital for conservation efforts.
            </p>
            <p class="pb-3 last:pb-0">
              With cutting-edge AI technology and acoustic innovation, Arbimon empowers individuals and organizations to transform sound into actionable insights.
            </p>
          </div>
        </div>
        <div class="basis-7/12">
          <div class="youtube-container rounded-2xl">
            <iframe src="https://www.youtube.com/embed/2-ZQes55LCo?autoplay=1&mute=1&loop=1&color=white&controls=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=2-ZQes55LCo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.youtube-container {
    overflow: hidden;
    width: 100%;
    /* Keep it the right aspect-ratio */
    aspect-ratio: 16/9;
    /* No clicking/hover effects */
    pointer-events: none;

    iframe {
      /* Extend it beyond the viewport... */
      width: 300%;
      height: 100%;
      /* ...and bring it back again */
      margin-left: -100%;
    }
}
</style>
