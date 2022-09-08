import { DetectValidation, DetectValidationParams, DetectValidationResponse } from '@rfcx-bio/common/api-bio/detect/detect-validation'

import { Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'

// const client: ValidationClient = InMemoryValidationClient()

export const detectValidationHandler: Handler<DetectValidationResponse, DetectValidationParams, unknown, DetectValidation[]> = async (req) => {
  // Inputs & validation
  const { jobId } = req.params
  assertPathParamsExist({ jobId })

  const jobIdInteger = parseInt(jobId)
  if (Number.isNaN(jobIdInteger)) throw BioInvalidPathParamError({ jobId })

  // const detections = req.body

  // await client.validateDetections(client, detections)
  return { message: '' }
}

// interface ValidationClient {
//   validateDetections: Function()
//   getDetections: Function()
// }

// function InMemoryValidationClient() {
//   const detectionsInDatabase = [] // TODO load default detections from a constant or json file

//   return {
//     validateDetections: async (detections) => {
//       for (d in detections) {
//         const i = detectionsInDatabase.find(d => d...)
//         detectionsInDatabase[i].status = 10
//       }
//     },
//     getDetections: async (x, y, z) => { // Do a separate fake GET endpoint
//       await setTimeout(1000)
//       return detectionsInDatabase.map(...)
//     }
//   }
// }

// function CoreValidationClient() {
//   return {
//     validateDetections: async (detections) => {
//       // call api
//     },
//     getDetections: ...
//   }
// }
