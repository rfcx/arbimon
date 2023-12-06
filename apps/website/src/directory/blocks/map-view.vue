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
import { computed, onMounted, ref, watch } from 'vue'

import { createMap } from '~/maps'
import type { ProjectLight } from '../data/types'

// TODO: set default if data is empty
const props = withDefaults(defineProps<{
  data: ProjectLight[],
  selectedProjectId?: number
}>(), {
  selectedProjectId: undefined
})
const emit = defineEmits<{(e: 'emitSelectedProject', projectId: number): void}>()

const mapCenter = computed((): [number, number] => {
  if (props.data.length === 0) return [0, 0]
  const lat = props.data.reduce((acc, datum) => acc + datum.avgLatitude, 0) / props.data.length
  const lng = props.data.reduce((acc, datum) => acc + datum.avgLongitude, 0) / props.data.length
  return [lng, lat]
})

const mapBounds = computed((): [number, number, number, number] => {
  if (props.data.length === 0) return [-180, -90, 180, 90]
  const latNorth = Math.max(...props.data.map(datum => datum.avgLatitude))
  const latSouth = Math.min(...props.data.map(datum => datum.avgLatitude))
  const lngWest = Math.min(...props.data.map(datum => datum.avgLongitude))
  const lngEast = Math.max(...props.data.map(datum => datum.avgLongitude))
  return [lngWest, latSouth, lngEast, latNorth]
})

const mapConfig = computed((): MapboxOptions => ({
  style: 'mapbox://styles/mapbox/satellite-streets-v11',
  center: mapCenter.value,
  attributionControl: false,
  container: 'mapRoot',
  bounds: mapBounds.value,
  preserveDrawingBuffer: true,
  zoom: 1.8
}))

const mapRoot = ref<InstanceType<typeof HTMLElement> | null>(null)

let map!: MapboxMap

const toGeoJson = (mapData: ProjectLight[]): FeatureCollection => {
  // Define map data
  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features: mapData.map(datum => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [datum.avgLongitude, datum.avgLatitude] },
      properties: {
        title: datum.name,
        id: datum.id,
        slug: datum.slug
        // radius: props.mapBaseFormatter.getRadius(Number(datum.values[props.dataKey])), // TODO Remove this once boolean is removed from type
        // popup: getPopup(datum)
      }
    }))
  }
  return data
}

onMounted(() => {
  map = createMap({ ...mapConfig.value, container: mapRoot.value as HTMLElement })

  map.on('load', () => {
    map.addSource('projects', {
      type: 'geojson',
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: toGeoJson(props.data),
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

watch(() => props.selectedProjectId, (id) => {
  if (id === undefined) return
  flyToProject(id)
})

// TODO: if the props.data updated, the data source of the map should be updated as well
watch(() => props.data, (newData) => {
  if (map.loaded() === false || newData === props.data) return
  if (map.getSource('projects') === undefined) {
    map.addSource('projects', { type: 'geojson', data: toGeoJson(newData) })
  } else {
    (map.getSource('projects') as GeoJSONSource).setData(toGeoJson(newData))
  }
})

const flyToProject = (id: number) => {
  const setCoordinateToRight = (coordinates: [number, number]) => {
    const [lng, lat] = coordinates
    const newLng = lng - 0.03
    return [newLng, lat] as [number, number]
  }
  const project = props.data.find(datum => datum.id === id)
  const coordinates = [project?.avgLongitude ?? 0, project?.avgLatitude ?? 0] as [number, number]

  // check if already at coordinates
  const currentCenter = map.getCenter()
  if (currentCenter.lng === coordinates[0] && currentCenter.lat === coordinates[1]) return

  map.flyTo({
    center: setCoordinateToRight(coordinates), // to avoid overlapping with sidebar
    zoom: 12.5,
    essential: true
  })
}
</script>
