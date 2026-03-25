# Stage 2: Article Search

In Stage 1 you built a pipeline that ingests articles and stores them as JSON documents in Redis. Now you'll make them searchable. Redis isn't just a key-value store—it has a built-in search engine that can index and query JSON documents directly. You'll define a search index, write structured queries using TAG and NUMERIC filters, and add semantic search using the vector embeddings you generated in Stage 1.

By the end of this stage, the **Search** panel in the app will let you filter articles by source, topic, entity, and date range—and find articles by meaning using natural language queries.

## What You'll Learn

- How **Redis Search** indexes JSON documents without moving data to a separate search engine
- How to define a **search index** with TAG, NUMERIC, and VECTOR fields
- How to write **structured queries** using TAG filters and NUMERIC ranges
- How to perform **semantic search** using vector similarity (KNN)
- How to combine structured filters and vector search into a single query

## Files You'll Work In

All of the code for this stage lives in a single file:

| File                                          | What It Does                                   |
| --------------------------------------------- | ---------------------------------------------- |
| `services/article-service/article-service.ts` | Creates the search index and implements search |

The routes, the frontend, and the types are already wired up. You just need to build the index and write the search logic.

## Let's Go

Ready? Start with [Creating a Search Index](1-creating-a-search-index.md).
