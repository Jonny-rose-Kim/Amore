#!/bin/bash
# Start Cloudflare Tunnel for GPU servers
#
# Prerequisites:
#   1. Install cloudflared:
#      curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
#      chmod +x /usr/local/bin/cloudflared
#
#   2. Login to Cloudflare:
#      cloudflared tunnel login
#
#   3. Create tunnel:
#      cloudflared tunnel create amore-gpu
#
#   4. Route DNS (replace yourdomain.com with your actual domain):
#      cloudflared tunnel route dns amore-gpu gpu0.yourdomain.com
#      cloudflared tunnel route dns amore-gpu gpu1.yourdomain.com
#      cloudflared tunnel route dns amore-gpu gpu2.yourdomain.com
#      cloudflared tunnel route dns amore-gpu gpu3.yourdomain.com
#
#   5. Update cloudflare-tunnel.yml with your tunnel ID and hostnames
#
# Usage:
#   ./start_cloudflare_tunnel.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/cloudflare-tunnel.yml"

echo "=== AMORE CLUE - Cloudflare Tunnel Start ==="
echo ""

# Check cloudflared installed
if ! command -v cloudflared &> /dev/null; then
    echo "ERROR: cloudflared is not installed."
    echo "Install: curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && chmod +x /usr/local/bin/cloudflared"
    exit 1
fi

# Check config exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: Config file not found: $CONFIG_FILE"
    exit 1
fi

# Check GPU servers are running
echo "Checking GPU servers..."
for port in 5001 5002 5003 5004; do
    if curl -s "http://localhost:${port}" > /dev/null 2>&1; then
        echo "  Port ${port}: OK"
    else
        echo "  Port ${port}: Not responding (will start tunnel anyway)"
    fi
done

echo ""
echo "Starting Cloudflare Tunnel..."
echo "GPU0 (5001): review-summary, sns-analysis, keyword-why, category-trend, rag-insight"
echo "GPU1 (5002): plc-prediction, category-prediction, whitespace-product"
echo "GPU2 (5003): country-strategy, category-strategy, whitespace-category"
echo "GPU3 (5004): VLM chatbot (Qwen2-VL)"
echo ""

cloudflared tunnel --config "$CONFIG_FILE" run
