#!/bin/bash
# AMORE CLUE Cloud Deployment Script
#
# Architecture:
#   Firebase Hosting (UI) → Cloud Run (API) → MongoDB Atlas (DB)
#                                ↓
#                      Cloudflare Tunnel → Local GPU Servers (5001-5004)
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (gcloud auth login)
#   - Firebase CLI installed (npm install -g firebase-tools)
#   - Docker installed (for local testing only)
#
# Usage:
#   ./deploy.sh server    # Deploy API server to Cloud Run
#   ./deploy.sh frontend  # Build and deploy frontend to Firebase
#   ./deploy.sh all       # Deploy both

set -e

# Add gcloud, cloudflared, and MongoDB tools to PATH
export PATH="/home/jinwook/google-cloud-sdk/bin:/home/jinwook/.local/bin:/home/jinwook/mongodb-database-tools-ubuntu2204-x86_64-100.12.0/bin:$PATH"
export CLOUDSDK_PYTHON=/home/jinwook/google-cloud-sdk/platform/bundledpythonunix/bin/python3

PROJECT_ID="amore-fc103"
REGION="asia-northeast3"
SERVICE_NAME="amore-server"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

print_warn() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Check required tools
check_tools() {
    local missing=0
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not installed. Run: curl https://sdk.cloud.google.com | bash"
        missing=1
    fi
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI not installed. Run: npm install -g firebase-tools"
        missing=1
    fi
    if [ $missing -eq 1 ]; then
        exit 1
    fi
}

# Deploy API server to Cloud Run
deploy_server() {
    print_step "Deploying API Server to Cloud Run"

    cd "$(dirname "$0")/server"

    # Load production env vars (prefer .env.production over .env)
    if [ -f .env.production ]; then
        source .env.production
        echo "Loaded environment from .env.production"
    elif [ -f .env ]; then
        source .env
        echo "Loaded environment from .env"
    fi

    if [ -z "$MONGODB_URI" ]; then
        print_error "MONGODB_URI not set. Add to server/.env.production"
        echo "Example: MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net'"
        exit 1
    fi

    # Build and push Docker image using Cloud Build
    print_step "Building Docker image with Cloud Build"
    gcloud builds submit --tag "${IMAGE_NAME}" --project "${PROJECT_ID}"

    # Set environment variables for Cloud Run
    ENV_VARS="MONGODB_URI=${MONGODB_URI}"
    ENV_VARS="${ENV_VARS},MONGODB_DATABASE=amore"
    ENV_VARS="${ENV_VARS},NODE_ENV=production"

    if [ -n "$GEMINI_API_KEY" ]; then
        ENV_VARS="${ENV_VARS},GEMINI_API_KEY=${GEMINI_API_KEY}"
    fi

    # GPU Server URLs (set these after Cloudflare Tunnel is configured)
    if [ -n "$LLM_SERVER_GPU0" ]; then
        ENV_VARS="${ENV_VARS},LLM_SERVER_GPU0=${LLM_SERVER_GPU0}"
    fi
    if [ -n "$LLM_SERVER_GPU1" ]; then
        ENV_VARS="${ENV_VARS},LLM_SERVER_GPU1=${LLM_SERVER_GPU1}"
    fi
    if [ -n "$LLM_SERVER_GPU2" ]; then
        ENV_VARS="${ENV_VARS},LLM_SERVER_GPU2=${LLM_SERVER_GPU2}"
    fi
    if [ -n "$LLM_SERVER_GPU3" ]; then
        ENV_VARS="${ENV_VARS},LLM_SERVER_GPU3=${LLM_SERVER_GPU3}"
    fi

    # Deploy to Cloud Run
    print_step "Deploying to Cloud Run (${REGION})"
    gcloud run deploy "${SERVICE_NAME}" \
        --image "${IMAGE_NAME}" \
        --platform managed \
        --region "${REGION}" \
        --project "${PROJECT_ID}" \
        --allow-unauthenticated \
        --memory 512Mi \
        --timeout 300 \
        --set-env-vars "${ENV_VARS}"

    # Get the service URL
    SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
        --platform managed \
        --region "${REGION}" \
        --project "${PROJECT_ID}" \
        --format 'value(status.url)')

    echo ""
    echo -e "${GREEN}Cloud Run deployed successfully!${NC}"
    echo "Service URL: ${SERVICE_URL}"
    echo ""
    echo "Health check: curl ${SERVICE_URL}/api/health"
    echo ""

    # Update .env.production with the Cloud Run URL
    cd "$(dirname "$0")"
    echo "VITE_API_BASE_URL=${SERVICE_URL}/api" > .env.production
    echo -e "${GREEN}Updated .env.production with API URL${NC}"

    cd "$(dirname "$0")"
}

# Build and deploy frontend to Firebase
deploy_frontend() {
    print_step "Building and Deploying Frontend to Firebase"

    cd "$(dirname "$0")"

    # Check .env.production exists and has a real URL
    if [ ! -f .env.production ]; then
        print_error ".env.production not found. Deploy server first: ./deploy.sh server"
        exit 1
    fi

    API_URL=$(grep VITE_API_BASE_URL .env.production | cut -d= -f2-)
    if [[ "$API_URL" == *"YOUR_CLOUD_RUN_URL"* ]]; then
        print_error ".env.production still has placeholder URL. Deploy server first."
        exit 1
    fi

    echo "Using API URL: ${API_URL}"

    # Install dependencies and build
    print_step "Installing dependencies"
    npm install

    print_step "Building production bundle"
    npm run build

    # Deploy to Firebase
    print_step "Deploying to Firebase Hosting"
    firebase deploy --only hosting --project "${PROJECT_ID}"

    echo ""
    echo -e "${GREEN}Firebase deployed successfully!${NC}"
    echo "Frontend URL: https://${PROJECT_ID}.web.app"
    echo ""
}

# Main
case "${1:-all}" in
    server)
        check_tools
        deploy_server
        ;;
    frontend)
        check_tools
        deploy_frontend
        ;;
    all)
        check_tools
        deploy_server
        deploy_frontend
        ;;
    *)
        echo "Usage: $0 {server|frontend|all}"
        exit 1
        ;;
esac
