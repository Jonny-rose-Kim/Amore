#!/bin/bash
# LLM Server GPU2 Startup Script
# EXAONE-3.5-7.8B-Instruct on GPU 2 (conda env: amore_clue)

echo "Starting LLM server on port 5003..."
echo "Model: LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"
echo "GPU: cuda:2 (NVIDIA RTX A6000)"
echo "Endpoints: country-strategy"
echo "Conda env: amore_clue"
echo ""

cd "$(dirname "$0")"

# GPU 설정 - cuda:2 사용 (Python 코드에서 직접 지정)
# CUDA_VISIBLE_DEVICES는 설정하지 않음 (전체 GPU 접근 필요)

# Conda 환경 활성화
source ~/anaconda3/etc/profile.d/conda.sh
conda activate amore_clue

python3 llm_server_gpu2.py
