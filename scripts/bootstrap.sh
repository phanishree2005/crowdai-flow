#!/usr/bin/env bash
set -eo pipefail

echo "======================================"
echo " Bootstrapping CrowdFlow Environments "
echo "======================================"

# Check dependencies
command -v helm >/dev/null 2>&1 || { echo >&2 "helm is required but not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo >&2 "kubectl is required but not installed. Aborting."; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo >&2 "terraform is required but not installed. Aborting."; exit 1; }

echo "[1/4] Applying foundational Kubernetes namespaces..."
kubectl create namespace crowdflow-system --dry-run=client -o yaml | kubectl apply -f -

echo "[2/4] Installing Istio Base and CRDs..."
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update
helm upgrade --install istio-base istio/base -n istio-system --create-namespace --wait
helm upgrade --install istiod istio/istiod -n istio-system --wait

echo "[3/4] Initializing Terraform state..."
cd deploy/terraform
terraform init

echo "[4/4] Generating local development certificates (Mock TLS)..."
mkdir -p ../certs
# Use openssl to generate self-signed if cert-manager isn't present for local dev
if [ ! -f "../certs/tls.crt" ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ../certs/tls.key -out ../certs/tls.crt \
    -subj "/CN=api.crowdflow.internal/O=CrowdFlow"
  
  kubectl create secret tls crowdflow-cert \
    --key ../certs/tls.key \
    --cert ../certs/tls.crt \
    -n crowdflow-system --dry-run=client -o yaml | kubectl apply -f -
fi

echo "Bootstrap complete. Proceed with terraform apply and deploy.sh."
