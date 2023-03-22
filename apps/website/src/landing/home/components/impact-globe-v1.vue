<template>
  <div
    ref="globeRoot"
  />
</template>
<script setup lang="ts">
import * as d3 from 'd3'
import type { Feature } from 'geojson'
import type { GlobeInstance } from 'globe.gl'
// import Globe from 'globe.gl'
import { onMounted, ref, watchEffect } from 'vue'

const props = defineProps({
  selectedVisualization: { type: String, default: undefined }
})
const globeRoot = ref<InstanceType<typeof HTMLElement> | null>(null)
let globe: GlobeInstance | undefined
let places = { features: [] }
let countries = { features: [] }

const GLOBE_ALTITUDE = 1
const latLng = (lat: number, lng: number) => ({ lat, lng, altitude: GLOBE_ALTITUDE })
interface VisualizationConfig { pointOfView: { lat: number, lng: number, altitude: number }, label: boolean, polygon: boolean }
const globeVisualizations: Record<string, VisualizationConfig> = {
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
const isFeature = (value: unknown): value is Feature => value !== null && typeof value === 'object' && 'properties' in value && typeof (value as Feature).properties === 'object'

onMounted(async () => {
  const { default: Globe } = await import('globe.gl')

  places = await fetch('https://globe.gl/example/datasets/ne_110m_populated_places_simple.geojson').then(res => res.json())
  countries = await fetch('https://globe.gl/example/datasets/ne_110m_admin_0_countries.geojson').then(res => res.json())

  const getVal = (feat: Feature) => feat.properties?.GDP_MD_EST / Math.max(1e5, feat.properties?.POP_EST)
  const maxVal = Math.max(...countries.features.map(getVal))
  const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd)
  colorScale.domain([0, maxVal])

  const createGlobe = Globe()
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    .backgroundColor('#141525')
    .height(globeRoot.value?.clientHeight ?? 672)
    .width(globeRoot.value?.clientWidth ?? 600)
    .labelLat(d => isFeature(d) ? d.properties?.latitude : 0)
    .labelLng(d => isFeature(d) ? d.properties?.longitude : 0)
    .labelText(d => isFeature(d) ? d.properties?.name : 0)
    .labelSize(d => isFeature(d) ? Math.sqrt(d.properties?.pop_max) * 4e-4 : 0)
    .labelDotRadius(d => isFeature(d) ? Math.sqrt(d.properties?.pop_max) * 4e-4 : 0)
    .labelColor(() => 'rgba(255, 165, 0, 0.75)')
    .labelResolution(2)
    .polygonAltitude(0.03)
    .polygonCapColor(feat => colorScale(isFeature(feat) ? getVal(feat) : 0))
    .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
    .polygonStrokeColor(() => '#111')
    .polygonLabel(feat => isFeature(feat) ? `GDP: <i>${feat.properties?.GDP_MD_EST}</i> M$<br/>Population: <i>${feat.properties?.POP_EST}</i>` : '')
    .onPolygonHover(hoverD => globe?.polygonAltitude(d => d === hoverD ? 0.12 : 0.06).polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(isFeature(d) ? getVal(d) : 0)))
    .polygonsTransitionDuration(300)
  globe = createGlobe(globeRoot.value as HTMLElement)
  globe.controls().enableZoom = false
})

watchEffect(() => {
  if (props.selectedVisualization === undefined) return
  const visualization = globeVisualizations[props.selectedVisualization]
  globe?.labelsData(visualization.label ? places.features : [])
  globe?.polygonsData(visualization.polygon ? countries.features : [])
  globe?.pointOfView(visualization.pointOfView, 1000)
})
</script>
