import { type ComputedRef, type Ref, ref, watch } from 'vue'

import { type ReviewStatus } from '@rfcx-bio/common/api-bio/detect/detect-detections'

import { type DetectionEvent, type DetectionMedia } from '../cnn-job-detail/components/types'

export interface UseDetectionsReview {
  validationCount: Ref<number>
  isOpen: Ref<boolean>
  closeValidator: () => void
  updateSelectedDetections: (detectionId: string, event: DetectionEvent) => void
  updateValidatedDetections: (selectedDetectionIds: string[], validation: ReviewStatus, responses: Array<PromiseSettledResult<string>>) => void
  getSelectedDetectionIds: () => string[]
}

export const useDetectionsReview = (allSpecies: ComputedRef<Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }>>): UseDetectionsReview => {
  const validationCount = ref<number>(0)
  const isOpen = ref<boolean>(false)
  const isShiftHolding = ref<boolean>(false)
  const isCtrlHolding = ref<boolean>(false)
  const currentDetectionId = ref<string | undefined>(undefined)

  watch(isShiftHolding, (newVal, oldVal) => {
    if (newVal !== oldVal && !isShiftHolding.value) {
      resetSelection(currentDetectionId.value)
      validationCount.value = getValidationCount()
    }
  })

  watch(isCtrlHolding, (newVal, oldVal) => {
    if (newVal !== oldVal && !isCtrlHolding.value) {
      resetSelection(currentDetectionId.value)
      validationCount.value = getValidationCount()
    }
  })

  const updateSelectedDetections = (detectionId: string, event: DetectionEvent): void => {
    const { isSelected, isShiftKeyHolding, isCtrlKeyHolding } = event
    selectDetection(detectionId, isSelected)
    currentDetectionId.value = detectionId
    isShiftHolding.value = isShiftKeyHolding
    isCtrlHolding.value = isCtrlKeyHolding

    if (isShiftHolding.value) {
      const combinedDetections = getCombinedDetections()
      const selectedDetectionIds = getSelectedDetectionIds()
      const firstInx = combinedDetections.findIndex(d => d.id === selectedDetectionIds[0])
      const secondInx = combinedDetections.findIndex(d => d.id === selectedDetectionIds[selectedDetectionIds.length - 1])
      const arrayOfIndx = [firstInx, secondInx].sort((a, b) => a - b)
      const filteredDetections = combinedDetections.filter((_det, index) => index >= arrayOfIndx[0] && index <= arrayOfIndx[1])
      const ids = filteredDetections.map(det => det.id)
      allSpecies.value.forEach(species => {
        species.media.forEach((det: DetectionMedia) => {
          if (ids.includes(det.id)) {
            det.checked = true
          }
        })
      })
    }
    validationCount.value = getValidationCount()
    isOpen.value = true
  }

  const resetSelection = (skippedId?: string): void => {
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (skippedId !== undefined && det.id === skippedId) return
        det.checked = false
      })
    })
  }

  const selectDetection = (detectionId: string, checked: boolean): void => {
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (detectionId === det.id) {
          det.checked = checked
        }
      })
    })
  }

  const getSelectedDetectionIds = (): string[] => {
    const selectedDetectionIds: string[] = []
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (det.checked === true) {
          selectedDetectionIds.push(det.id)
        }
      })
    })

    // use localeCompare to sort because it's bigint, we could lose precision in the future
    return selectedDetectionIds.sort((a, b) => a.localeCompare(b))
  }

  const getValidationCount = (): number => {
    let count = 0
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (det.checked === true) {
          count++
        }
      })
    })

    return count
  }

  const getCombinedDetections = (): DetectionMedia[] => {
    let combinedDetections: DetectionMedia[] = []

    allSpecies.value.forEach(species => {
      combinedDetections = combinedDetections.concat(species.media)
    })

    return combinedDetections
  }

  const updateValidatedDetections = (selectedDetectionIds: string[], validation: ReviewStatus, responses: Array<PromiseSettledResult<string>>): void => {
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        // only update status to success review update
        if (selectedDetectionIds.includes(det.id) && responses.find(r => r.status === 'fulfilled') != null) {
          det.validation = validation
        }
      })
    })

    validationCount.value = 0
    resetSelection()
    isOpen.value = false
  }

  const closeValidator = () => {
    isOpen.value = false
  }

  return {
    validationCount,
    isOpen,
    closeValidator,
    updateSelectedDetections,
    updateValidatedDetections,
    getSelectedDetectionIds
  }
}
