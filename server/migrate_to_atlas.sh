#!/bin/bash
# Migrate local MongoDB data to MongoDB Atlas
#
# Usage:
#   export ATLAS_URI="mongodb+srv://amore_admin:YOUR_PASSWORD@cluster0.mhfe3ia.mongodb.net"
#   ./migrate_to_atlas.sh
#
# This script:
# 1. Dumps the local 'amore' database
# 2. Restores it to MongoDB Atlas

set -e

export PATH="/home/jinwook/mongodb-database-tools-ubuntu2204-x86_64-100.12.0/bin:$PATH"

LOCAL_URI="mongodb://localhost:27017"
DB_NAME="amore"
DUMP_DIR="/tmp/amore_dump"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check Atlas URI
if [ -z "$ATLAS_URI" ]; then
    echo -e "${RED}ERROR: ATLAS_URI not set${NC}"
    echo "Usage: export ATLAS_URI='mongodb+srv://amore_admin:PASSWORD@cluster0.mhfe3ia.mongodb.net'"
    echo "       ./migrate_to_atlas.sh"
    exit 1
fi

echo -e "${GREEN}=== MongoDB Migration: Local → Atlas ===${NC}"
echo ""
echo "Source: ${LOCAL_URI}/${DB_NAME}"
echo "Target: Atlas cluster (${DB_NAME})"
echo ""

# Step 1: Dump local database
echo -e "${GREEN}[1/2] Dumping local database...${NC}"
rm -rf "${DUMP_DIR}"
mongodump --uri="${LOCAL_URI}" --db="${DB_NAME}" --out="${DUMP_DIR}"

echo ""
echo "Dump complete. Collections:"
ls "${DUMP_DIR}/${DB_NAME}/"
echo ""

# Step 2: Restore to Atlas
echo -e "${GREEN}[2/2] Restoring to Atlas...${NC}"
mongorestore --uri="${ATLAS_URI}" --db="${DB_NAME}" --drop "${DUMP_DIR}/${DB_NAME}/"

echo ""
echo -e "${GREEN}Migration complete!${NC}"
echo ""
echo "Verify with:"
echo "  mongosh '${ATLAS_URI}/${DB_NAME}' --eval 'db.getCollectionNames()'"
echo ""

# Cleanup
rm -rf "${DUMP_DIR}"
echo "Temp dump cleaned up."
