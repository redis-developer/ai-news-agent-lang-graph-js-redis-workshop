# Stage 1: Feed Ingestion

In this stage, you'll build a LangGraph.js workflow that takes raw RSS feed items and transforms them into enriched, searchable articles stored in Redis. By the end, the **Ingest** button in the app will fetch feeds, process them through your workflow, and store the results as JSON documents in Redis.

## What You'll Build

The ingestion workflow does a lot with each feed item: it extracts clean text from the HTML, generates a summary, classifies topics, extracts named entities (people, organizations, locations), and creates a vector embedding. These all get assembled into a single article and saved to Redis.

You'll build this incrementally—starting with the simplest possible graph and adding complexity step by step.

## What You'll Learn

- How to define **graph state** using `Annotation.Root()` in LangGraph.js
- How to write **nodes**—functions that take state and return partial state updates
- How to wire nodes together with **edges** to form a graph
- How to use **fan-out** to run nodes in parallel
- How to use **fan-in** with `defer` to wait for parallel branches to complete
- How to store JSON documents in **Redis** using `redis.json.set`

## Files You'll Work In

All of the code for this stage lives in the `server/src/workflows/ingestion/` directory:

| File                                | What It Does                                          |
| ----------------------------------- | ----------------------------------------------------- |
| `state.ts`                          | Defines the graph state that flows between nodes      |
| `workflow.ts`                       | Builds the graph—adds nodes, edges, and compiles it   |
| `agents/text-extractor-agent.ts`    | Extracts clean text from the raw feed item            |
| `agents/summarizer-agent.ts`        | Generates a summary of the extracted text             |
| `agents/topic-classifier-agent.ts`  | Classifies the article into topics                    |
| `agents/entity-extractor-agent.ts`  | Extracts people, organizations, and locations         |
| `agents/embedder-agent.ts`          | Creates a vector embedding from the title and summary |
| `agents/article-assembler-agent.ts` | Combines all the pieces into a final article          |

You'll also write a function in the article service to save articles to Redis:

| File                                          | What It Does                              |
| --------------------------------------------- | ----------------------------------------- |
| `services/article-service/article-service.ts` | Saves articles as JSON documents in Redis |

The feed fetching, the ingestion loop, and the frontend are already wired up. You just need to build the workflow and the save function.

## Let's Go

Ready? Start with [The Simplest Graph: Text Extraction](1-simplest-graph.md).
