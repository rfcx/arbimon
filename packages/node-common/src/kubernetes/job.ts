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
