# Redis + LangGraph.js Workshop

A hands-on workshop for building agentic AI applications using Redis and LangGraph.js. Build a news aggregator that fetches articles from RSS feeds, summarizes them, extracts named entities, generates embeddings, and stores everything in Redis. Then search, chat, and generate news briefs — all powered by AI.

## What You'll Learn

- **Ingestion workflows** — Fetch RSS feeds, summarize articles, extract named entities, generate embeddings, and store everything in Redis
- **Hybrid search** — Combine vector similarity with structured filtering using Redis Search
- **Tool-enabled RAG** — Build a chatbot that retrieves and reasons over news articles
- **Agent memory** — Give your agent short-term and long-term memory with Redis Agent Memory Server

## Tech Stack

- **[LangGraph.js](https://github.com/langchain-ai/langgraphjs)** — Workflow orchestration for AI agents
- **[Redis](https://redis.io/)** — Data storage with vector search and structured filtering
- **[Redis Agent Memory Server](https://github.com/redis-developer/agent-memory-server)** — Short and long-term memory for agents
- **[Svelte 5](https://svelte.dev/)** — Modern reactive frontend
- **[Express](https://expressjs.com/)** — Node.js API server
- **[OpenAI](https://openai.com/)** — LLM and embedding models

## Prerequisites

- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — For running the workbench and all services
- **[OpenAI API key](https://platform.openai.com/api-keys)** — For LLM and embedding models

## Getting Started

1. Clone the repo:

   ```bash
   git clone git@github.com:redis-developer/ai-news-agent-lang-graph-js-redis-workshop.git
   cd ai-news-agent-workshop
   ```

2. Copy the sample environment file and add your OpenAI API key:

   ```bash
   cp .env.sample .env
   ```

   Then edit `.env` and replace `sk-proj-your-openai-key` with your actual key.

3. Start the workbench:

   ```bash
   ./start.sh
   ```

4. Open http://localhost in your browser.

The workbench provides everything you need in a single browser tab:

| Panel             | Description                            |
| ----------------- | -------------------------------------- |
| **Instructions**  | Step-by-step workshop guide (sidebar)  |
| **Code**          | VS Code editor for writing code        |
| **App**           | The news agent application             |
| **Terminal**      | Shared terminal running the dev server |
| **Redis Insight** | Browse and inspect your Redis data     |

## Stopping the Workbench

```bash
docker compose down
```

To also remove stored data (Redis, Redis Insight, VS Code settings):

```bash
docker compose down -v
```

## Talk Abstracts

The `abstracts/` folder contains two versions of the talk abstract:

- **CONFERENCE-ABSTRACT.md** — A version for developer conferences
- **CORPORATE-ABSTRACT.md** — A version for corporate/enterprise events
