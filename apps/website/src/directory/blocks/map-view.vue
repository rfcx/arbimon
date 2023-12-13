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

import defaultMarkerIcon from '@/_assets/explore/map-marker.png'
import selectedMarkerIcon from '@/_assets/explore/map-marker-selected.png'
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
  const markers: Record<string, string> = {
    'selected-marker': selectedMarkerIcon,
    'default-marker': defaultMarkerIcon
  }

  map.on('load', () => {
    // load image for markers
    Object.entries(markers).forEach(([name, imagePath]) => {
      map.loadImage(imagePath, (error, image) => {
        if (error) throw error
        if (map.hasImage(name) || image === undefined) return
        map.addImage(name, image)
      })
    })
    map.addSource('projects', {
      type: 'geojson',
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: toGeoJson(props.data),
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 100 // Radius of each cluster when clustering points (defaults to 50)
    })

    setSelectedProject(props.selectedProjectId ?? -1)

    map.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'projects',
      layout: {
        'icon-image': 'default-marker',
        'icon-size': 0.65
      }
    })
    
    map.addLayer({
      id: 'selected-project',
      type: 'symbol',
      source: 'selected-project',
      layout: {
        'icon-image': 'selected-marker',
        'icon-size': 0.95
      }
    })

    // Add cluser layers
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'projects',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#050608',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          25,
          750,
          35
       ]
      }
    })

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'projects',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': [
          'case',
          ['<', ['get', 'point_count'], 10],
          ['get', 'point_count'],
          '10+'
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#FFFEFC'
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
          center: setCoordinateToRight(coordinates),
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

  map.on('click', 'selected-project', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['selected-project'] })
    const { id } = features[0]?.properties ?? {}
    emit('emitSelectedProject', id)
  })
  
})

watch(() => props.selectedProjectId, (id) => {
  setSelectedProject(id)
  if (id === undefined) {
    map.flyTo({
      center: mapCenter.value,
      zoom: 1.8,
      essential: true
    })
    return
  }
  flyToProject(id)
})

// TODO: if the props.data updated, the data source of the map should be updated as well
watch(() => props.data, (newData) => {
  if (map.loaded() === false) { return }
  if (map.getSource('projects') === undefined) {
    map.addSource('projects', { type: 'geojson', data: toGeoJson(newData) })
  } else {
    (map.getSource('projects') as GeoJSONSource).setData(toGeoJson(newData))
    map.easeTo({
      center: mapCenter.value
    })
  }
})

const setCoordinateToRight = (coordinates: [number, number]) => {
  const [lng, lat] = coordinates
  const newLng = lng - 0.03
  return [newLng, lat] as [number, number]
}

const setSelectedProject = (id: number | undefined) => {
  if (id === undefined) { map.removeSource('selected-project') }
  const selectedProjectGeoJson = toGeoJson(props.data.filter(datum => datum.id === id))
  console.log('setSelectedProject', id, selectedProjectGeoJson)
  if (map.getSource('selected-project') === undefined) {
    map.addSource('selected-project', {
    type: 'geojson',
    data: selectedProjectGeoJson
  })
  } else {
    (map.getSource('selected-project') as GeoJSONSource).setData(selectedProjectGeoJson)
  }
}

const flyToProject = (id: number) => {
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
