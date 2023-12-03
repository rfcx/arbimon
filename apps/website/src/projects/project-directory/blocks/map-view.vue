<template>
  <div
    ref="mapRoot"
    class="w-full h-full"
    :style="{ height: `95vh` }"
  />
</template>
<script setup lang="ts">
import type { FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, Map as MapboxMap, MapboxOptions } from 'mapbox-gl'
import { computed, onMounted, ref } from 'vue'

import { createMap } from '~/maps'
import type { MapProjectData } from '~/maps/types'

const props = defineProps<{ data: MapProjectData[] }>()
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void}>()

const mapCenter = computed((): [number, number] => {
  const lat = props.data.reduce((acc, datum) => acc + datum.latitude, 0) / props.data.length
  const lng = props.data.reduce((acc, datum) => acc + datum.longitude, 0) / props.data.length
  return [lng, lat]
})

const mapBounds = computed((): [number, number, number, number] => {
  const latNorth = Math.max(...props.data.map(datum => datum.latitude))
  const latSouth = Math.min(...props.data.map(datum => datum.latitude))
  const lngWest = Math.min(...props.data.map(datum => datum.longitude))
  const lngEast = Math.max(...props.data.map(datum => datum.longitude))
  return [lngWest, latSouth, lngEast, latNorth]
})

const mapConfig: MapboxOptions = {
  style: 'mapbox://styles/mapbox/satellite-streets-v11',
  center: mapCenter.value,
  attributionControl: false,
  container: 'mapRoot',
  bounds: mapBounds.value,
  preserveDrawingBuffer: true,
  zoom: 3
}

const mapRoot = ref<InstanceType<typeof HTMLElement> | null>(null)

let map!: MapboxMap

const toGeoJson = (mapData: MapProjectData[]): FeatureCollection => {
  // Define map data
  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features: mapData.map(datum => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [datum.longitude, datum.latitude] },
      properties: {
        title: datum.projectName,
        id: datum.projectId,
        slug: datum.projectSlug
        // radius: props.mapBaseFormatter.getRadius(Number(datum.values[props.dataKey])), // TODO Remove this once boolean is removed from type
        // popup: getPopup(datum)
      }
    }))
  }
  return data
}

onMounted(() => {
  const d = toGeoJson(props.data)
  map = createMap({ ...mapConfig, container: mapRoot.value as HTMLElement })
  map.on('load', () => {
    map.addSource('projects', {
      type: 'geojson',
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: d,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    })

    // Add cluser layers
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'projects',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    })

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'projects',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-size': 12
      }
    })

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'projects',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 10,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    })
  })

  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    const clusterId = features[0]?.properties?.cluster_id ?? ''
    if (clusterId === undefined || clusterId === '') return
    (map.getSource('projects') as GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
      const coordinates = (features[0]?.geometry as Point).coordinates.slice() as [number, number]
      if (err === null) {
        map.easeTo({
          center: coordinates,
          zoom
        })
      }
    })
  })

  map.on('click', 'unclustered-point', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    const { id } = features[0]?.properties ?? {}
    emit('emitSelectedProject', id)
  })
})
</script>
