# Deployment

Overview:
- Biodiversity Analytics is built and deployed by Jenkins (jenkins.rfcx.org) as defined in [Jenkinsfile](./Jenkinsfile) which can be found in [here](https://jenkins.rfcx.org/job/Biodiversity%20Analytics%20Web/)
- Deployment is triggered by push to master/staging. All configuration is in the sub-folders `testing`, `staging` and `production` (corresponding to a Kubernetes namespace).
- Deployment notifications are posted on Slack #alerts-deployment and #alerts-deployment-production
- Deployment is based on nginx

## Test deployment locally

Requires Docker.

1.  Build the image
    ```
    docker build . -t biodiversity-analytics -f build\Dockerfile
    ```

2.  Run the app
    ```
    docker run --rm -it -p 8080:8080 biodiversity-analytics/testing
    ```

*If your port 8080 is in use, then you can change the port to other e.g. `-p 7373:8080` to open http://localhost:7373/*


## Kubernetes configuration

Each sub-folder matches the name of a namespace in Kubernetes. The app name is `biodiversity-analytics` in each namespace. For each namespace folder:

- deployment.yaml - set the resources
- config.yaml - environment variables (non secret configuration)
- ingress.yaml - set the sub-domain
- service.yaml
