# Deployment

Overview:

- Biodiversity Analytics is built and deployed by a Github Actions [workflow](../.github/workflows/build-deploy.yml) -- this workflow deploys both `api` (node/fastify) and `website` (nginx/vue)
- The workflow is triggered by pushes to master/staging/develop; runs can be found [here](https://github.com/rfcx/biodiversity-analytics/actions)
- Build is done inside a Docker container (see [`Dockerfile`](./Dockerfile))
- Deployment is made to Kubernetes (configuration folders `production`, `staging` and `testing` correspond to the Kubernetes namespace)
- Notifications are posted on Slack `#alerts-deployment` and `#alerts-deployment-production`

## Test deployment locally

Requires:

- Docker
- Allocate at least 4GB memory to Docker (preferences > resources)

Steps:

1. If you have previously built your code, you should run clean:

    ```
    pnpm -r clean
    ```

2.  Build & run API image (from monorepo root)

    ```
    docker build -f tools/deployment/Dockerfile --target api -t bio-api .
    docker run --rm -it -p 3000:8080 bio-api
    ```

3.  Build & run Website image (from monorepo root)

    ```
    docker build -f tools/deployment/Dockerfile --target website -t bio-website .
    docker run --rm -it -p 8101:8080 bio-website
    ```

4.  Build & run CLI image (from monorepo root)

    ```
    docker build -f tools/deployment/Dockerfile --target cli -t bio-cli .
    docker run --rm -it bio-cli node --experimental-specifier-resolution=node apps/cli/lib/path/to/some-script.js
    ```

_Use `-p 7373:8080` to map Docker to another port (ex: `http://localhost:7373`), if your local port 8080 is already in use_
_Use `--network="host"` if you want access to other local services, ex: to run CLI scripts against your local DB_

## Kubernetes configuration

***Warning:** If you rename a Kubernetes namespace, configuration for the old name is not deleted automatically by CD -- you must manually delete it (or you will have 2 copies of everything).*

The Biodiversity app names are `biodiversity-api` and `biodiversity-website`. Each sub-folder matches a namespace in Kubernetes. Inside the namespace folder is:

- config.yaml - runtime non-secret environment variables ("configuration")
- deployment.yaml - configure resources
- ingress.yaml - configure sub-domain
- service.yaml - configure ports

## Secrets

Secrets must be defined in 4 locations:
- `src/_services/env/keys.ts` -- list of keys (for type checking)
- `.env.example` -- list of keys & fake values committed to GitHub
- `.env` -- values to use locally
- `1password vault` -- value to use on testing/staging/production

**After updating secrets in 1password you must ask a team member with Kubernetes access to apply your update**
