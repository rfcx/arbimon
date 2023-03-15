<template>
  <section class="relative h-168 bg-white dark:bg-mirage-gray">
    <div
      ref="globeRoot"
      class="absolute w-9/12 inset-y-0 left-0"
    />
    <div class="absolute w-3/12 inset-y-0 right-0 py-8 sm:py-24 px-4 mr-75 lg:px-6 pointer-events-none">
      <div class="text-right">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Our Impact at a Glance
        </h2>
        <p class="text-gray-500 sm:text-xl dark:text-gray-400">
          With more than 100 million recordings, Arbimon uncovers the behaviour of some of the world's most endangered species, paving the way for a better understanding of our planet.
        </p>

        <div
          class="inline-flex rounded-md shadow-sm mt-12 ml-auto pointer-events-auto"
          role="group"
        >
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900  border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            :class="{ 'bg-gray-200 dark:bg-gray-600': selectedGlobeVisualization === 'species' }"
            @click="selectedGlobeVisualization = 'species'"
          >
            Species
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900 border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            :class="{ 'bg-gray-200 dark:bg-gray-600': selectedGlobeVisualization === 'countries' }"
            @click="selectedGlobeVisualization = 'countries'"
          >
            Countries
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900 border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700  dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
            :class="{ 'bg-gray-200 dark:bg-gray-600': selectedGlobeVisualization === 'projects' }"
            @click="selectedGlobeVisualization = 'projects'"
          >
            Projects
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import * as d3 from 'd3'
import type { GlobeInstance } from 'globe.gl'
import Globe from 'globe.gl'
import { onMounted, ref, watchEffect } from 'vue'

type GlobeVisualization = 'species' | 'countries' | 'projects'
const selectedGlobeVisualization = ref<GlobeVisualization>('projects')
const globeRoot = ref<InstanceType<typeof HTMLElement> | null>(null)
let globe: GlobeInstance | undefined
let places = { features: [] }
let countries = { features: [] }

const GLOBE_ALTITUDE = 1
const latLng = (lat: number, lng: number) => ({ lat, lng, altitude: GLOBE_ALTITUDE })
const globeVisualizations = {
  species: {
    pointOfView: latLng(-7.567, -64.876),
    label: true,
    polygon: false
  },
  countries: {
    pointOfView: latLng(16.123, 101.123),
    label: false,
    polygon: true
  },
  projects: {
    pointOfView: latLng(60.123, 0),
    label: false,
    polygon: false
  }
}

// Temp

onMounted(async () => {
  places = await fetch('https://globe.gl/example/datasets/ne_110m_populated_places_simple.geojson').then(res => res.json())
  countries = await fetch('https://globe.gl/example/datasets/ne_110m_admin_0_countries.geojson').then(res => res.json())

  const getVal = feat => feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST)
  const maxVal = Math.max(...countries.features.map(getVal))
  const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd)
  colorScale.domain([0, maxVal])

  const createGlobe = Globe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .backgroundColor('#141525')
    .height(globeRoot.value?.clientHeight ?? 672)
    .width(globeRoot.value?.clientWidth ?? 600)
    .labelLat(d => d.properties.latitude)
    .labelLng(d => d.properties.longitude)
    .labelText(d => d.properties.name)
    .labelSize(d => Math.sqrt(d.properties.pop_max) * 4e-4)
    .labelDotRadius(d => Math.sqrt(d.properties.pop_max) * 4e-4)
    .labelColor(() => 'rgba(255, 165, 0, 0.75)')
    .labelResolution(2)
    .polygonAltitude(0.03)
    .polygonCapColor(feat => colorScale(getVal(feat)))
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(({ properties: d }) => `
      <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
      GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
      Population: <i>${d.POP_EST}</i>
    `)
    .onPolygonHover(hoverD => globe?.polygonAltitude(d => d === hoverD ? 0.12 : 0.06).polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(getVal(d)))
    )
    .polygonsTransitionDuration(300)
  globe = createGlobe(globeRoot.value as HTMLElement)
  globe.controls().enableZoom = false
  selectedGlobeVisualization.value = 'species'
})

watchEffect(() => {
  const visualization = globeVisualizations[selectedGlobeVisualization.value]
  globe?.labelsData(visualization.label ? places.features : [])
  globe?.polygonsData(visualization.polygon ? countries.features.filter(d => d.properties.ISO_A2 !== 'AQ') : [])
  globe?.pointOfView(visualization.pointOfView, 1000)
})

</script>
