<p align="center">
  <img src="image/amore_clue.png" alt="AMORE CLUE" width="280"/>
</p>

<h1 align="center">AMORE CLUE</h1>
<h3 align="center">Cosmetic Landscape & Utility Engine</h3>

<p align="center">
  <strong>Two-Track Multi-Agent AI System for Global Beauty Trend Intelligence</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/LangGraph-Multi_Agent-blue?style=flat-square" alt="LangGraph"/>
  <img src="https://img.shields.io/badge/RAG-Advanced-green?style=flat-square" alt="RAG"/>
  <img src="https://img.shields.io/badge/GPU-4x_Parallel-orange?style=flat-square" alt="GPU"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
</p>

---

## Overview

AMORE CLUE는 글로벌 뷰티 시장의 트렌드를 **수집 - 분석 - 예측**하는 Two-Track Multi-Agent AI 시스템입니다.

**Track 1**은 매일 자동으로 데이터를 크롤링하고 트렌드를 분류하며, **Track 2**는 LangGraph 기반 AI Agent들이 실시간으로 인사이트를 생성합니다.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AMORE CLUE System                            │
├────────────────────────────┬────────────────────────────────────────┤
│    Track 1: Data Pipeline  │     Track 2: AI Analysis Engine        │
│    (Daily Batch Agent)     │     (Real-time LangGraph Agents)       │
│                            │                                        │
│  Crawling → Extraction     │   Query → Routing → RAG → Generation  │
│  → Classification → DB    │   → Reflection → Response              │
└────────────────────────────┴────────────────────────────────────────┘
```

---

## Architecture

### Two-Track Agent Flow

```mermaid
graph TB
    subgraph "Track 1: Data Pipeline Agent"
        C[Scheduled Crawler] --> E[Data Extractor Agent]
        E --> T[Trend Classifier Agent]
        T --> DB[(MongoDB)]
    end

    subgraph "Track 2: AI Analysis Agent"
        Q[User Query] --> R[LangGraph Router]
        R --> RAG[RAG Engine]
        R --> LLM[LLM Agents]
        RAG --> VDB[(ChromaDB)]
        RAG --> LLM
        LLM --> REF[Self-Reflection]
        REF --> RES[Response]
    end

    DB --> RAG
    DB --> LLM
```

---

## Track 1: Data Pipeline Agent Flow

하루 단위로 실행되는 자동화된 데이터 수집 및 트렌드 분류 파이프라인입니다.

### Pipeline Stages

```mermaid
graph LR
    A[Multi-Source\nCrawler] -->|Raw Data| B[LLM Keyword\nExtractor]
    B -->|Structured| C[Multi-Signal\nTrend Classifier]
    C -->|Classified| D[MongoDB\nDB Builder]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e9
```

| Stage | Agent | Input | Output | DB Collection |
|-------|-------|-------|--------|---------------|
| 1. Crawling | `Scheduler Agent` | Target URLs (Retail, SNS, Review) | Raw HTML/JSON | `raw_retail_sales`, `raw_reviews`, `raw_sns_posts` |
| 2. Extraction | `Keyword Extractor` | Product descriptions | Ingredient, Formula, Effect, Mood | `keyword_extractions` |
| 3. Classification | `Trend Classifier` | Multi-signal scores | Early / Growing / Actionable | `trend_classifications` |
| 4. DB Build | `Aggregation Agent` | Classified trends | Leaderboard, Combinations | `leaderboard`, `combinations` |

### Trend Classification Logic

다요소 점수 기반 하이브리드 분류 시스템:

```
Signal Sources (3):
├── SNS: Instagram, TikTok, YouTube mention volume & growth
├── Retail: Amazon, Olive Young sales rank & velocity
└── Review: Rating, sentiment, keyword frequency

Classification Thresholds:
├── Early Trend:      Growth ≥ 30% | Persistence ≥ 2weeks | Signal Consistency ≥ 0.3
├── Growing Trend:    Growth ≥ 10% | Persistence ≥ 4weeks | Signal Consistency ≥ 0.6
└── Actionable Trend: Growth ≥ 5%  | Persistence ≥ 6weeks | Signal Consistency ≥ 0.8
```

### Data Sources & Collections

```
MongoDB (Structured Data)
├── raw_retail_sales      : 리테일 판매 순위 원본 데이터
├── raw_reviews           : 제품 리뷰 원본 데이터
├── raw_sns_posts         : SNS 언급량 원본 데이터
├── keyword_extractions   : LLM 추출 키워드 (성분/제형/효과/무드)
├── trend_classifications : 트렌드 분류 결과
├── leaderboard           : 국가별/카테고리별 리더보드
├── combinations          : 성분+제형 조합 분석 결과
├── sns_platform_stats    : 플랫폼별 SNS 통계
└── batch_job_logs        : 배치 작업 이력
```

---

## Track 2: AI Analysis Agent Flow

LangGraph 기반 Multi-Agent 시스템이 실시간으로 사용자 쿼리를 분석하고, 최신 RAG 기술을 적용하여 인사이트를 생성합니다.

### LangGraph Agent Orchestration

```mermaid
graph TB
    subgraph "LangGraph State Machine"
        START((Start)) --> ROUTER{Adaptive\nRouter}

        ROUTER -->|"Trend Query"| CRAG[CRAG Agent]
        ROUTER -->|"Product Analysis"| SELFRAG[Self-RAG Agent]
        ROUTER -->|"Strategy"| HYDE[HyDE Agent]
        ROUTER -->|"Prediction"| MQ[Multi-Query Agent]
        ROUTER -->|"Visual"| VLM[VLM Agent]

        CRAG --> REFLECT{Self-Reflection}
        SELFRAG --> REFLECT
        HYDE --> REFLECT
        MQ --> REFLECT

        REFLECT -->|"Pass"| GENERATE[Response Generator]
        REFLECT -->|"Fail"| ROUTER

        VLM --> GENERATE
        GENERATE --> END((End))
    end
```

### GPU Distribution & Features

4개 GPU에 분산 배치된 AI Agent들:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        GPU Cluster (4x GPUs)                             │
├─────────────────┬─────────────────┬─────────────────┬────────────────────┤
│  GPU 0 (:5001)  │  GPU 1 (:5002)  │  GPU 2 (:5003)  │  GPU 3 (:5004)    │
│  EXAONE-3.5-7.8B│  EXAONE-3.5-7.8B│  EXAONE-3.5-7.8B│  Qwen2-VL-2B     │
├─────────────────┼─────────────────┼─────────────────┼────────────────────┤
│ • Review Summary│ • PLC Prediction│ • Country       │ • Multimodal Chat  │
│ • SNS Analysis  │ • Category      │   Strategy      │ • Image Analysis   │
│ • Keyword Why   │   Prediction    │ • Category      │ • Visual Q&A       │
│ • Category Trend│ • Whitespace    │   Strategy      │                    │
│ • RAG Insight   │   Product       │ • Whitespace    │                    │
│                 │                 │   Category      │                    │
└─────────────────┴─────────────────┴─────────────────┴────────────────────┘
```

### Advanced RAG Techniques

각 기능에 최적화된 최신 RAG 기술을 적용합니다:

#### 1. Adaptive RAG (Router-based)

쿼리 복잡도에 따라 최적의 검색 전략을 동적으로 선택합니다.

```mermaid
graph LR
    Q[Query] --> CL{Complexity\nClassifier}
    CL -->|Simple| DS[Direct Search]
    CL -->|Moderate| MR[Multi-step Retrieval]
    CL -->|Complex| AG[Agentic RAG]

    DS --> G[Generate]
    MR --> G
    AG --> G
```

| 적용 기능 | 전략 | 설명 |
|-----------|------|------|
| Review Summary | Direct Search | 리뷰 데이터 직접 검색 후 요약 |
| Keyword Why | Multi-step | 키워드 → 관련 트렌드 → 원인 분석 |
| Country Strategy | Agentic | 다국가 데이터 비교 분석 후 전략 도출 |

#### 2. Corrective RAG (CRAG)

검색된 문서의 관련성을 평가하고, 부적절할 경우 웹 검색으로 보정합니다.

```
┌─────────┐     ┌──────────┐     ┌────────────┐
│ Retrieve │ ──▶ │ Evaluate │ ──▶ │  Relevant? │
└─────────┘     └──────────┘     └────────────┘
                                    │Yes    │No
                                    ▼       ▼
                              ┌────────┐ ┌──────────┐
                              │Generate│ │Web Search│
                              └────────┘ │+ Refine  │
                                         └──────────┘
```

| 적용 기능 | Data Source | Fallback |
|-----------|------------|----------|
| Category Trend | `trend_classifications` + ChromaDB | SNS 실시간 데이터 보정 |
| RAG Insight | `combinations` + Vector DB | 외부 뷰티 트렌드 리포트 |

#### 3. Self-RAG (Self-Reflective)

생성된 응답의 품질을 스스로 평가하고, 기준 미달 시 재생성합니다.

```mermaid
graph TB
    R[Retrieve] --> G1[Generate]
    G1 --> CR{Critique\nTokens}
    CR -->|"IsRel: Yes\nIsSup: Yes\nIsUse: Yes"| OUT[Final Output]
    CR -->|"Any: No"| R
```

| 적용 기능 | 평가 기준 | Reflection 조건 |
|-----------|----------|----------------|
| SNS Analysis | Factual grounding | 데이터 수치와 불일치 시 재생성 |
| PLC Prediction | Logical consistency | 시계열 논리 오류 시 재생성 |
| Whitespace Product | Market feasibility | 비현실적 제안 시 재생성 |

#### 4. HyDE (Hypothetical Document Embeddings)

쿼리로부터 가상 문서를 생성한 뒤, 해당 임베딩으로 유사 문서를 검색합니다.

```
Query: "2024년 미백 트렌드 성분은?"
         │
         ▼
┌─────────────────────────────┐
│ LLM generates hypothetical  │
│ document about whitening     │
│ trend ingredients 2024...    │
└─────────────────────────────┘
         │ embed
         ▼
┌─────────────────────────────┐
│ Vector Search with HyDE      │
│ embedding → Better recall    │
└─────────────────────────────┘
```

| 적용 기능 | 장점 | Vector DB |
|-----------|------|-----------|
| Category Strategy | 추상적 전략 쿼리의 검색 정확도 향상 | ChromaDB |
| Category Prediction | 미래 트렌드 예측을 위한 유사 과거 패턴 검색 | ChromaDB |

#### 5. Multi-Query RAG

하나의 쿼리를 여러 관점으로 분해하여 검색 커버리지를 극대화합니다.

```
Original Query: "레티놀 성분이 왜 인기인가?"
         │
         ├── Sub-Query 1: "레티놀 효과 리뷰 분석"
         ├── Sub-Query 2: "레티놀 SNS 언급량 추이"
         ├── Sub-Query 3: "레티놀 포함 제품 판매 순위"
         └── Sub-Query 4: "레티놀 관련 성분 트렌드"
                    │
                    ▼ Reciprocal Rank Fusion
              ┌──────────┐
              │ Merged    │
              │ Context   │
              └──────────┘
```

| 적용 기능 | Sub-Query 전략 | Fusion 방식 |
|-----------|---------------|-------------|
| Keyword Why | 효과/리뷰/SNS/판매 4방향 분해 | Reciprocal Rank Fusion |
| Whitespace Category | 경쟁/수요/공급/트렌드 분해 | Weighted Score Fusion |

#### 6. Parent-Document Retrieval

세분화된 chunk로 검색하되, 응답 생성 시에는 상위 문서 전체를 컨텍스트로 활용합니다.

```
Document Store:
├── Parent: 전체 제품 리뷰 보고서 (2000 tokens)
│   ├── Child Chunk 1: 성분 분석 (200 tokens) ← Search hit
│   ├── Child Chunk 2: 사용감 리뷰 (200 tokens)
│   └── Child Chunk 3: 가격 비교 (200 tokens)
│
└── Retrieved Context: Parent 전체 (2000 tokens) → Richer generation
```

| 적용 기능 | Parent 단위 | Child 단위 |
|-----------|------------|------------|
| Review Summary | 제품별 리뷰 전체 | 개별 리뷰 문장 |
| RAG Insight | 카테고리별 트렌드 리포트 | 키워드별 통계 |

---

### Feature - RAG - DB Mapping

각 AI 기능이 어떤 RAG 기술과 데이터를 사용하는지 한눈에 보여줍니다:

```mermaid
graph LR
    subgraph "Features"
        F1[Review Summary]
        F2[SNS Analysis]
        F3[Keyword Why]
        F4[Category Trend]
        F5[PLC Prediction]
        F6[Country Strategy]
        F7[Category Prediction]
        F8[Whitespace Analysis]
        F9[RAG Insight]
        F10[VLM Chatbot]
    end

    subgraph "RAG Tech"
        R1[Adaptive RAG]
        R2[CRAG]
        R3[Self-RAG]
        R4[HyDE]
        R5[Multi-Query]
        R6[Parent-Doc]
    end

    subgraph "Data Store"
        DB1[(MongoDB\nStructured)]
        DB2[(ChromaDB\nVector)]
        DB3[(Chat History\nMemory)]
    end

    F1 --> R1 & R6
    F2 --> R3
    F3 --> R5
    F4 --> R2
    F5 --> R3
    F6 --> R1 & R4
    F7 --> R4
    F8 --> R3 & R5
    F9 --> R2 & R6
    F10 --> DB3

    R1 & R2 & R3 --> DB1
    R4 & R5 & R6 --> DB2
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript + Tailwind CSS | Dashboard UI |
| Build | Vite 5 | Fast HMR & Build |
| Backend | Node.js + Express | API Gateway & Proxy |
| AI Orchestration | LangGraph + LangChain | Multi-Agent Workflow |
| LLM (Text) | EXAONE-3.5-7.8B-Instruct (x3 GPU) | Text Generation |
| VLM (Vision) | Qwen2-VL-2B-Instruct (GPU3) | Multimodal Analysis |
| Cloud LLM | Google Gemini 1.5 Pro/Flash | Batch Processing |
| Vector DB | ChromaDB | Embedding Search |
| Database | MongoDB Atlas | Persistent Storage |
| Hosting | Firebase Hosting | Frontend CDN |
| Tunnel | Cloudflare Tunnel | GPU Server Exposure |

---

## Project Structure

```
amore_ver2/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/               # 25 React components
│   ├── services/api.ts           # API client
│   ├── data/                     # Data utilities
│   └── App.tsx                   # Main application
│
├── server/                       # Backend
│   ├── index.js                  # Express API gateway
│   ├── routes/                   # API endpoints (7 route files)
│   ├── services/                 # Business logic
│   │   ├── trendClassifier.js    # Multi-signal trend classification
│   │   ├── batchProcessor.js     # Daily batch pipeline
│   │   ├── llmAgents.js          # LLM agent orchestration
│   │   ├── langchain_workflow.py # LangGraph multi-agent workflow
│   │   └── gemini_agents.py      # Gemini-based agents
│   ├── scripts/                  # DB seeding & utilities
│   ├── llm_server.py             # GPU0: Review, SNS, Keyword, RAG
│   ├── llm_server_gpu1.py        # GPU1: PLC, Category, Whitespace
│   ├── llm_server_gpu2.py        # GPU2: Strategy, Whitespace Category
│   ├── llm_server_gpu3.py        # GPU3: VLM Chatbot (Qwen2-VL)
│   └── Dockerfile                # Cloud Run container
│
├── .env.production               # Frontend env (API URL)
├── firebase.json                 # Firebase hosting config
└── package.json                  # Frontend dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.10+ with CUDA support
- MongoDB Atlas account
- 4x GPU (VRAM 16GB+ each)

### 1. Frontend Setup

```bash
npm install
npm run dev              # Development server
npx vite build           # Production build
npx firebase deploy --only hosting
```

### 2. Backend Setup

```bash
cd server
npm install
pip install -r requirements.txt

# Start API server
node index.js

# Start GPU LLM servers (4 separate terminals)
bash start_llm.sh        # GPU 0 - EXAONE (Review, SNS, Keyword, RAG)
bash start_llm_gpu1.sh   # GPU 1 - EXAONE (PLC, Category, Whitespace)
bash start_llm_gpu2.sh   # GPU 2 - EXAONE (Strategy)
bash start_llm_gpu3.sh   # GPU 3 - Qwen2-VL (Chatbot)
```

### 3. Tunnel Setup (for external access)

```bash
# Cloudflare Tunnel (HTTP/2)
cloudflared tunnel --url http://localhost:5000 --protocol http2
```

### 4. Environment Variables

```env
# server/.env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb+srv://your_connection_string
MONGODB_DATABASE=amore
PORT=5000
```

---

## API Endpoints

| Method | Endpoint | GPU | Description |
|--------|----------|-----|-------------|
| POST | `/api/llm/review-summary` | GPU0 | 리뷰 요약 & 감성 분석 |
| POST | `/api/llm/sns-analysis` | GPU0 | SNS 트렌드 분석 |
| POST | `/api/llm/keyword-why` | GPU0 | 키워드 인기 원인 분석 |
| POST | `/api/llm/category-trend` | GPU0 | 카테고리 트렌드 예측 |
| POST | `/api/llm/rag-insight` | GPU0 | RAG 기반 심층 인사이트 |
| POST | `/api/llm/plc-prediction` | GPU1 | 제품 수명주기 예측 |
| POST | `/api/llm/category-prediction` | GPU1 | 카테고리 성장 예측 |
| POST | `/api/llm/whitespace-product` | GPU1 | 화이트스페이스 제품 발굴 |
| POST | `/api/llm/country-strategy` | GPU2 | 국가별 진출 전략 |
| POST | `/api/llm/category-strategy` | GPU2 | 카테고리 전략 수립 |
| POST | `/api/llm/whitespace-category` | GPU2 | 카테고리 갭 분석 |
| POST | `/api/chat/text` | GPU3 | VLM 텍스트 채팅 |
| POST | `/api/chat/multimodal` | GPU3 | VLM 이미지+텍스트 채팅 |
| POST | `/api/workflow/run` | Cloud | LangGraph 배치 워크플로우 |

---

## License

This project is proprietary software developed for AMOREPACIFIC Corporation.
