export const syncJob = (name: string, projectId: number): unknown => ({
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    name
  },
  spec: {
    ttlSecondsAfterFinished: 86400,
    template: {
      spec: {
        containers: [
          {
            name: 'arbimon-sync-container',
            image: '887044485231.dkr.ecr.eu-west-1.amazonaws.com/biodiversity-cli:latest', // TODO
            envFrom: [
              {
                secretRef: {
                  name: 'biodiversity-cli-secrets'
                }
              }
            ],
            env: [
              { name: 'PROJECT_ID', value: projectId.toString() }
            ],
            command: [
              'node',
              '--experimental-specifier-resolution=node',
              'apps/cli/lib/ingest/sync-fix-project.js'
            ]
          }
        ],
        restartPolicy: 'Never'
      }
    },
    backoffLimit: 0
  }
})

export const exportDetectionsJob = (name: string, classifierJobId: number, exportTypes: string, userEmail: string): object => ({
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    name
  },
  spec: {
    ttlSecondsAfterFinished: 43200,
    template: {
      spec: {
        containers: [
          {
            name: 'arbimon-export-detections',
            image: '887044485231.dkr.ecr.eu-west-1.amazonaws.com/biodiversity-cli:latest',
            envFrom: [
              {
                secretRef: {
                  name: 'biodiversity-cli-secrets'
                }
              },
              {
                configMapRef: {
                  name: 'biodiversity-cli-config'
                }
              }
            ],
            env: [
              {
                name: 'CLASSIFIER_JOB_EXPORT_ID',
                value: classifierJobId.toString()
              },
              {
                name: 'CLASSIFIER_JOB_EXPORT_TYPES',
                value: exportTypes
              },
              {
                name: 'CLASSIFIER_JOB_EXPORT_RECEIVER_EMAIL',
                value: userEmail
              }
            ],
            command: [
              'node',
              '--experimental-specifier-resolution=node',
              'apps/cli/lib/export-cnn/index.js'
            ]
          }
        ],
        restartPolicy: 'Never'
      }
    },
    backoffLimit: 0
  }
})
