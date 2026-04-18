#!/bin/bash
# =============================================================================
# EL-OHIF Viewer — Hostinger VPS Setup Script (Ubuntu 24.04 LTS)
# Docker Image: psda2/el-ohif-viewer:latest
#
# Data Sources:
#   1. 🏥 Orthanc (DEFAULT) — http://${VPS_IP}:8042  [Upload enabled]
#   2. ☁️  AWS CloudFront   — Public OHIF demo studies [Read-only]
#
# Usage:
#   chmod +x vps-setup.sh && ./vps-setup.sh
# =============================================================================
# ── 0. Environment Setup ────────────────────────────────────────────────────
# Load .env file if it exists
if [ -f .env ]; then
  export $(echo $(grep -v '^#' .env | xargs) | envsubst)
fi

# Use VPS_IP from environment or fallback to detected IP later
VPS_IP="${VPS_IP:-YOUR_VPS_IP}"

set -e

DOCKER_IMAGE="psda2/el-ohif-viewer:latest"
APP_DIR="/opt/el-ohif-viewer"

echo "============================================================"
echo " EL-OHIF Viewer — VPS Setup (Ubuntu 24.04 LTS)"
echo " Image  : $DOCKER_IMAGE"
echo " Proxy  : Supabase Edge Functions (Secure)"
echo "============================================================"

# ── 1. System update ────────────────────────────────────────────────────────
echo ""
echo "[1/6] Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install Docker Engine (official Ubuntu 24.04 method) ─────────────────
echo ""
echo "[2/6] Installing Docker Engine..."

if command -v docker &> /dev/null; then
  echo "  Docker already installed: $(docker --version)"
else
  apt-get install -y -qq ca-certificates curl gnupg

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu noble stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  systemctl enable docker
  systemctl start docker

  echo "  Docker installed: $(docker --version)"
  echo "  Compose installed: $(docker compose version)"
fi

# ── 3. Create deployment directory ──────────────────────────────────────────
echo ""
echo "[3/6] Setting up deployment directory: $APP_DIR..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# ── 4. Write docker-compose.yml ─────────────────────────────────────────────
echo ""
echo "[4/6] Writing docker-compose.yml..."

cat > "$APP_DIR/docker-compose.yml" << 'COMPOSE_EOF'
version: '3.8'

services:
  ohif-viewer:
    image: psda2/el-ohif-viewer:latest
    container_name: el-ohif-viewer
    ports:
      - '8080:8080'
    environment:
      - PORT=8080
      - PUBLIC_URL=/
      - ORTHANC_REMOTE_HOST=${VPS_IP:-YOUR_VPS_IP}
      - ORTHANC_HOST=http://${VPS_IP}:8042
      - APP_CONFIG=window.config={"routerBasename":"/","showStudyList":true,"extensions":[],"modes":[],"showWarningMessageForCrossOrigin":false,"showLoadingIndicator":true,"strictZSpacingForVolumeViewport":true,"maxNumberOfWebWorkers":3,"groupEnabledModesFirst":true,"allowMultiSelectExport":true,"studyPrefetcher":{"enabled":true,"displaySetsCount":2,"maxNumPrefetchRequests":10,"order":"closest"},"defaultDataSourceName":"orthanc","dataSources":[{"namespace":"@ohif/extension-default.dataSourcesModule.dicomweb","sourceName":"orthanc","configuration":{"friendlyName":"My PACS (Upload Studies Here)","name":"orthanc","wadoUriRoot":"/wado","qidoRoot":"/dicom-web","wadoRoot":"/dicom-web","qidoSupportsIncludeField":true,"supportsReject":true,"supportsStow":true,"dicomUploadEnabled":true,"imageRendering":"wadors","thumbnailRendering":"wadors","enableStudyLazyLoad":true,"supportsFuzzyMatching":true,"supportsWildcard":true,"omitQuotationForMultipartRequest":true,"bulkDataURI":{"enabled":true,"relativeResolution":"studies"}}},{"namespace":"@ohif/extension-default.dataSourcesModule.dicomweb","sourceName":"ohif","configuration":{"friendlyName":"☁️ OHIF Public Demo Studies (AWS)","name":"aws","wadoUriRoot":"/aws-dicomweb","qidoRoot":"/aws-dicomweb","wadoRoot":"/aws-dicomweb","qidoSupportsIncludeField":false,"imageRendering":"wadors","thumbnailRendering":"wadors","enableStudyLazyLoad":true,"supportsFuzzyMatching":true,"supportsWildcard":false,"dicomUploadEnabled":false,"staticWado":true,"singlepart":"bulkdata,video","bulkDataURI":{"enabled":true,"relativeResolution":"studies"},"omitQuotationForMultipartRequest":true}},{"namespace":"@ohif/extension-default.dataSourcesModule.dicomjson","sourceName":"dicomjson","configuration":{"friendlyName":"DICOM JSON","name":"json"}},{"namespace":"@ohif/extension-default.dataSourcesModule.dicomlocal","sourceName":"dicomlocal","configuration":{"friendlyName":"Local DICOM Files"}}]}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
COMPOSE_EOF

echo "  docker-compose.yml written."

# ── 5. Enable Orthanc CORS (if Orthanc config is found) ─────────────────────
echo ""
echo "[5/6] Checking Orthanc CORS configuration..."

ORTHANC_CONF=$(find /etc /opt /var 2>/dev/null -name "orthanc.json" | head -1)

if [ -n "$ORTHANC_CONF" ]; then
  echo "  Found Orthanc config at: $ORTHANC_CONF"
  echo "  ⚠️  Please manually ensure CORS is enabled in this file:"
  echo "      \"CorsEnabled\": true,"
  echo "      \"CorsAllowedOrigins\": [\"*\"],"
  echo "      \"RemoteAccessAllowed\": true"
else
  echo "  Orthanc config not auto-detected."
  echo "  ⚠️  Manually enable CORS in your Orthanc config before testing!"
fi

# ── 6. Pull image and start ──────────────────────────────────────────────────
echo ""
echo "[6/6] Pulling image and starting container..."
docker pull "$DOCKER_IMAGE"

# Stop existing container if running
if docker ps -q -f name=el-ohif-viewer | grep -q .; then
  echo "  Stopping existing container..."
  docker compose down
fi

docker compose up -d

sleep 5
echo ""
docker compose ps

# ── Summary ──────────────────────────────────────────────────────────────────
# Only detect IP if not already set
if [ -z "$VPS_IP" ]; then
  VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_VPS_IP")
fi
echo ""
echo "============================================================"
echo " ✅  SETUP COMPLETE!"
echo ""
echo " OHIF Viewer:         http://${VPS_IP}:8080"
echo " Orthanc UI:          http://${VPS_IP}:8042/ui/app/#/"
echo ""
echo " Data Sources available in Viewer:"
echo "   🏥 My PACS (DEFAULT) — Upload studies via Orthanc"
echo "   ☁️  OHIF Public Demo  — AWS CloudFront read-only"
echo ""
echo " Management commands (run from $APP_DIR):"
echo "   View logs:   docker compose logs -f"
echo "   Restart:     docker compose restart"
echo "   Update:      docker pull $DOCKER_IMAGE && docker compose up -d"
echo "   Stop:        docker compose down"
echo "============================================================"
