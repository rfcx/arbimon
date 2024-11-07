# Maintenance

## Enable maintenance mode

1. Build & push
   ```
   docker build --platform linux/amd64 -t 887044485231.dkr.ecr.eu-west-1.amazonaws.com/arbimon-maintenance:latest .
   docker login -u AWS -p $(aws ecr get-login-password --region eu-west-1) 887044485231.dkr.ecr.eu-west-1.amazonaws.com
   docker push 887044485231.dkr.ecr.eu-west-1.amazonaws.com/arbimon-maintenance:latest
   ```

2. Take down
   ```
   kubectl delete ingress arbimon-ingress-org-redirect -n production
   kubectl delete ingress arbimon-ingress -n production
   kubectl delete ingress biodiversity-website-ingress-legacy-redirect -n production
   kubectl delete ingress biodiversity-website-ingress -n production
   kubectl delete ingress biodiversity-website-with-api-ingress -n production
   ```

3. Deploy
   ```
   kubectl apply -f production
   ```

## Disable maintenance mode

1. Bring up your apps

2. Remove maintenance deployment
   ```
   kubectl delete ingress arbimon-maintenance-ingress -n production
   kubectl delete service arbimon-maintenance-service -n production
   kubectl delete deployment arbimon-maintenance -n production
   ```
