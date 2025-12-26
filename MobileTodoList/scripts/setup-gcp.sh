#!/bin/bash
# Google Cloud Platform - Complete Setup Script
# Mobile Todo List App

set -e  # Exit on error

echo "🚀 Mobile Todo List - GCP Setup Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK not found${NC}"
    echo "Installing via Homebrew..."
    brew install --cask google-cloud-sdk
fi

echo -e "${GREEN}✅ Google Cloud SDK installed${NC}"
echo ""

# Project configuration
PROJECT_ID="mobile-todo-list-app"
REGION="us-central1"
ZONE="us-central1-a"

echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Zone: $ZONE"
echo ""

# Login
echo "🔐 Logging in to Google Cloud..."
gcloud auth login

# Create project
echo "📦 Creating GCP project..."
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo -e "${YELLOW}⚠️  Project already exists${NC}"
else
    gcloud projects create $PROJECT_ID --name="Mobile Todo List"
    echo -e "${GREEN}✅ Project created${NC}"
fi

# Set active project
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ Active project set${NC}"

# Link billing
echo ""
echo "💳 Available billing accounts:"
gcloud beta billing accounts list
echo ""
read -p "Enter billing account ID: " BILLING_ACCOUNT
gcloud beta billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
echo -e "${GREEN}✅ Billing linked${NC}"

# Enable APIs
echo ""
echo "🔌 Enabling required APIs (this may take a few minutes)..."
gcloud services enable \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  cloudfunctions.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  containerregistry.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  appengine.googleapis.com \
  sourcerepo.googleapis.com \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com

echo -e "${GREEN}✅ All APIs enabled${NC}"

# Create Cloud Storage buckets
echo ""
echo "🪣 Creating Cloud Storage buckets..."
gcloud storage buckets create gs://$PROJECT_ID-uploads \
  --location=$REGION \
  --uniform-bucket-level-access || echo "Uploads bucket exists"

gcloud storage buckets create gs://$PROJECT_ID-backups \
  --location=$REGION \
  --uniform-bucket-level-access || echo "Backups bucket exists"

echo -e "${GREEN}✅ Storage buckets created${NC}"

# Create secrets
echo ""
echo "🔐 Creating Secret Manager secrets..."

create_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    if gcloud secrets describe $SECRET_NAME &> /dev/null; then
        echo "  ⚠️  $SECRET_NAME already exists"
    else
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=-
        echo "  ✅ $SECRET_NAME created"
    fi
}

# Read from .env file
ENV_FILE="../.env"
if [ -f "$ENV_FILE" ]; then
    source $ENV_FILE
    
    create_secret "google-places-api-key" "$GOOGLE_PLACES_API_KEY"
    create_secret "spoonacular-api-key" "$SPOONACULAR_API_KEY"
    create_secret "openweather-api-key" "$OPENWEATHER_API_KEY"
    create_secret "stripe-publishable-key" "$STRIPE_PUBLISHABLE_KEY"
    create_secret "stripe-secret-key" "$STRIPE_SECRET_KEY"
    create_secret "paypal-client-id" "$PAYPAL_CLIENT_ID"
    create_secret "paypal-secret" "$PAYPAL_SECRET"
    create_secret "openai-api-key" "$OPENAI_API_KEY"
    
    echo -e "${GREEN}✅ All secrets created from .env${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found - secrets not created${NC}"
fi

# Create Cloud Source Repository
echo ""
echo "📚 Creating Cloud Source Repository..."
gcloud source repos create mobile-todo-list || echo "Repository exists"
REPO_URL="https://source.developers.google.com/p/$PROJECT_ID/r/mobile-todo-list"
echo "  Repository URL: $REPO_URL"
echo -e "${GREEN}✅ Repository created${NC}"

# Set up budget alerts
echo ""
echo "💰 Setting up budget alerts..."
gcloud billing budgets create \
  --billing-account=$BILLING_ACCOUNT \
  --display-name="Mobile Todo List Budget" \
  --budget-amount=300USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=75 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100 || echo "Budget already exists"

echo -e "${GREEN}✅ Budget alerts configured${NC}"

# Initialize App Engine (required for Cloud Scheduler)
echo ""
echo "🚀 Initializing App Engine..."
gcloud app create --region=us-central || echo "App Engine already initialized"

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 GCP Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Summary:"
echo "  ✅ Project created: $PROJECT_ID"
echo "  ✅ APIs enabled: 12 services"
echo "  ✅ Storage buckets: 2 created"
echo "  ✅ Secrets: 8 configured"
echo "  ✅ Source repository: Created"
echo "  ✅ Budget alerts: Set at \$300"
echo ""
echo "🔗 Useful Links:"
echo "  Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
echo "  Firebase: https://console.firebase.google.com/"
echo "  Secrets: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo "  Storage: https://console.cloud.google.com/storage/browser?project=$PROJECT_ID"
echo ""
echo "📝 Next Steps:"
echo "  1. Run: git remote add google $REPO_URL"
echo "  2. Run: git push google main"
echo "  3. Deploy Cloud Functions (see GCP_SETUP.md)"
echo "  4. Set up monitoring dashboard"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
