#!/bin/bash
# Deployment script for EL-OHIF Viewer

REMOTE_HOST="76.13.99.8"
REMOTE_USER="root"
REMOTE_DIR="/opt/el-ohif-viewer"

echo "Deploying to $REMOTE_HOST..."

# Create remote directory
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# Copy docker-compose.prod.yml to the server as docker-compose.yml
scp docker-compose.prod.yml $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/docker-compose.yml

# Restart the service
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && docker compose pull && docker compose up -d"

echo "Deployment complete!"
