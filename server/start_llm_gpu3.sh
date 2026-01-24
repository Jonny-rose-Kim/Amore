#!/bin/bash
# VLM Chatbot Server GPU3 Startup Script
# Qwen/Qwen2-VL-2B-Instruct on GPU 3 (conda env: amore_clue)

echo "Starting VLM Chatbot server on port 5004..."
echo "Model: Qwen/Qwen2-VL-2B-Instruct"
echo "GPU: cuda:3"
echo "Endpoints: chat/text, chat/multimodal, chat/health"
echo "Conda env: amore_clue"
echo ""

cd "$(dirname "$0")"

# Conda 환경 활성화
source ~/anaconda3/etc/profile.d/conda.sh
conda activate amore_clue

python3 llm_server_gpu3.py
