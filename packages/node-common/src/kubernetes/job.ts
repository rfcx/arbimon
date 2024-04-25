export const syncJob = (name: string, projectIdArbimon: number): unknown => ({
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
                      env: {
                        ARBIMON_PROJECT_ID: projectIdArbimon.toString() // TODO not sure on format
                      },
                      command: [
                        'node',
                        '--experimental-specifier-resolution=node',
                        'apps/cli/lib/ingest/sync-fix-project-full.js'
                      ]
                  }
              ],
              restartPolicy: 'Never'
          }
      },
      backoffLimit: 0
  }
})
