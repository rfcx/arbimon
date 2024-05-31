import { type ComputedRef, type Ref, ref, watch } from 'vue'

import { type ArbimonReviewStatus } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'

import { type DetectionEvent, type DetectionMedia } from '../cnn-job-detail/components/types'

export interface UseDetectionsReview {
  validationCount: Ref<number>
  isOpen: Ref<boolean>
  isProcessing: Ref<boolean>
  closeValidator: () => void
  updateSelectedDetections: (detectionId: number, event: DetectionEvent) => void
  updateValidatedDetections: (selectedDetectionIds: number[], validation: ArbimonReviewStatus, responses: Array<PromiseSettledResult<void>>) => void
  getSelectedDetections: () => Array<{ id: number, prevStatus: ArbimonReviewStatus }>
  getSuggestedValidationStatus: () => ArbimonReviewStatus
  updateIsProcessing: (status: boolean) => void
}

export const useDetectionsReview = (allSpecies: ComputedRef<Array<{ speciesSlug: string, speciesName: string, media: DetectionMedia[] }>>): UseDetectionsReview => {
  const validationCount = ref<number>(0)
  const isOpen = ref<boolean>(false)
  const isShiftHolding = ref<boolean>(false)
  const isCtrlHolding = ref<boolean>(false)
  const isProcessing = ref<boolean>(false)
  const currentDetectionId = ref<number | undefined>(undefined)

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

  const updateSelectedDetections = (detectionId: number, event: DetectionEvent): void => {
    const { isSelected, isShiftKeyHolding, isCtrlKeyHolding } = event
    selectDetection(detectionId, isSelected)
    currentDetectionId.value = detectionId
    isShiftHolding.value = isShiftKeyHolding
    isCtrlHolding.value = isCtrlKeyHolding

    if (isShiftHolding.value) {
      const combinedDetections = getCombinedDetections()
      const selectedDetections = getSelectedDetections()
      const firstInx = combinedDetections.findIndex(d => d.id === selectedDetections[0].id)
      const secondInx = combinedDetections.findIndex(d => d.id === selectedDetections[selectedDetections.length - 1].id)
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

  const resetSelection = (skippedId?: number): void => {
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (skippedId !== undefined && det.id === skippedId) return
        det.checked = false
      })
    })
  }

  const selectDetection = (detectionId: number, checked: boolean): void => {
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (detectionId === det.id) {
          det.checked = checked
        }
      })
    })
  }

  const getSelectedDetections = (): Array<{ id: number, prevStatus: ArbimonReviewStatus }> => {
    const selectedDetectionIds: Array<{ id: number, prevStatus: ArbimonReviewStatus }> = []
    allSpecies.value.forEach(species => {
      species.media.forEach((det: DetectionMedia) => {
        if (det.checked === true) {
          selectedDetectionIds.push({ id: det.id, prevStatus: det.validation })
        }
      })
    })

    // use localeCompare to sort because it's bigint, we could lose precision in the future
    return selectedDetectionIds.sort((a, b) => a.id.toString().localeCompare(b.id.toString()))
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

  const updateValidatedDetections = (selectedDetectionIds: number[], validation: ArbimonReviewStatus, responses: Array<PromiseSettledResult<void>>): void => {
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

  const closeValidator = (): void => {
    isOpen.value = false
    resetSelection()
  }

  const getSuggestedValidationStatus = (): ArbimonReviewStatus => {
    let status: ArbimonReviewStatus = 'unvalidated'

    const selectedDetectionIds = getSelectedDetections()
    if (selectedDetectionIds.length > 0) {
      const validatedDetectionsStatus = allSpecies.value.flatMap(species => species.media).find(det => selectedDetectionIds.some(selected => selected.id === det.id))
      if (validatedDetectionsStatus) {
        status = validatedDetectionsStatus.validation
      }
    }

    return status
  }

  const updateIsProcessing = (status: boolean): void => {
    isProcessing.value = status
  }

  return {
    validationCount,
    isOpen,
    isProcessing,
    closeValidator,
    updateSelectedDetections,
    updateValidatedDetections,
    getSelectedDetections,
    getSuggestedValidationStatus,
    updateIsProcessing
  }
}
