#!/bin/bash
# LLM Server Startup Script
# EXAONE-3.5-7.8B-Instruct on GPU 0 (conda env: amore_clue)

echo "Starting LLM server on port 5001..."
echo "Model: LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"
echo "GPU: cuda:0 (NVIDIA RTX A6000)"
echo "Conda env: amore_clue"
echo ""

cd "$(dirname "$0")"

# GPU 설정
export CUDA_VISIBLE_DEVICES=0

# Conda 환경 활성화
source ~/anaconda3/etc/profile.d/conda.sh
conda activate amore_clue

python3 llm_server.py
