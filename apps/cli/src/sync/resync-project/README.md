# recync-project

The recync-project job:

- Resync project sites
- Resync project species
- Resync project species calls
- Resync project recordings
- Resync project detections

## Initial Configuration

Check [main README] for initial configuration.
The job can be running with Kubernetes enviroments or locally.
For running it locally, please setup credentials by copying `.env.sample` to `.env` and filling it with your keys.
After fixing the project data, it takes to check and remove recordings from `recordings_deleted` table for this
specific project from the Arbimon DB.

## Installing / Getting started

Run script via Kubernetes

```sh
sed -e 's|set-project-id|{ARBIMON_PROJECT_ID}|g' build/production/recync-project/deployment.yaml.sample | kubectl apply -f -
```

Add `ARBIMON_PROJECT_ID` to the command above. After running a script you will see the log with a job name, like: `job.batch/recync-project-job-{PROJECT_ID} created`

Run script locally

1. Add `ARBIMON_PROJECT_ID` to the `.env` file
2. Run the job

```sh
cd apps/cli && pnpm serve lib/sync/resync-project/index.js
```
