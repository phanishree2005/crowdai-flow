#!/usr/bin/env bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <image_tag>"
  echo "Example: $0 v1.0.0"
  exit 1
fi

IMAGE_TAG=$1
HELM_RELEASE_NAME="crowdflow"
NAMESPACE="crowdflow-system"

echo "Deploying CrowdFlow AI Enterprise with Tag: $IMAGE_TAG"

# Apply Istio routing first
kubectl apply -f deploy/istio/ -n $NAMESPACE

# Upgrade main application stack via Helm
helm upgrade --install $HELM_RELEASE_NAME ./deploy/helm \
  --namespace $NAMESPACE \
  --set global.imageTag=$IMAGE_TAG \
  --set auth.image.tag=$IMAGE_TAG \
  --set telemetry.image.tag=$IMAGE_TAG \
  --set routing.image.tag=$IMAGE_TAG \
  --set cv.image.tag=$IMAGE_TAG \
  --set predictive.image.tag=$IMAGE_TAG \
  --set analytics.image.tag=$IMAGE_TAG \
  --wait \
  --timeout 10m

echo "Deployment of $IMAGE_TAG successful!"
