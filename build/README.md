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

1.  Build & run API image

    ```
    docker build -f build/Dockerfile --target api -t bio-api .
    docker run --rm -it -p 8080:8080 bio-api
    ```

2.  Build & run Website image

    ```
    docker build -f build/Dockerfile --target website -t bio-website .
    docker run --rm -it -p 8080:8080 bio-website
    ```

_If your local port 8080 is in use, then you can select another port e.g. `-p 7373:8080` to map Docker to http://localhost:7373/_

## Kubernetes configuration

The app names are always `biodiversity-api` and `biodiversity-website`. Each sub-folder matches a namespace in Kubernetes. Inside the namespace folder is:

- deployment.yaml - configure resources
- config.yaml - environment variables (non secret configuration)
- ingress.yaml - configure sub-domain
- service.yaml - configure ports
