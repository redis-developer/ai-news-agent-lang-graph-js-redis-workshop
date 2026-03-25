# Semantic Search

In the previous step, you built structured queries—filtering by exact tags and date ranges. That works when you know precisely what you're looking for: articles about "AI" from "TechCrunch" in the last week. But what if you want to find articles about "recent breakthroughs in renewable energy"? No tag will match that phrase exactly. This is where **semantic search** comes in.

Remember the embeddings you generated in Stage 1? Each article has a vector that captures its meaning. Now you'll use those vectors to find articles by similarity—converting a natural language query into a vector and finding the articles whose vectors are closest to it.

## Files You'll Work In

| File                                          | What It Does                            |
| --------------------------------------------- | --------------------------------------- |
| `services/article-service/article-service.ts` | Add semantic search to `searchArticles` |

## Embedding the Query

Back in `searchArticles`, you need to handle the case where the user provides a `semanticQuery` string. The first step is converting that text into a vector using the same embedding model that encoded the articles:

```typescript
let vectorBuffer: Buffer | null = null
if (criteria.semanticQuery) {
  const embedder = fetchEmbedder()
  const embedding = await embedder.embedQuery(criteria.semanticQuery)
  vectorBuffer = Buffer.from(new Float32Array(embedding).buffer)
}
```

`fetchEmbedder()` returns the same embedding model instance used in Stage 1. `embedQuery` converts the text into an array of numbers. Then we need to convert it to raw bytes—Redis expects vector data as a binary buffer, not a JSON array. The conversion is a two-step process: `new Float32Array(embedding)` packs the number array into a typed array of 32-bit floats (matching the `FLOAT32` type we specified in the index schema), and `Buffer.from(...)` wraps its underlying `.buffer` (an `ArrayBuffer`) into a Node.js `Buffer`. Yes, `Buffer.from()` takes a buffer—the naming is a bit circular, but `ArrayBuffer` and `Buffer` are different types in Node.js.

Add this code after the TAG and NUMERIC filter blocks, before the query assembly.

## The KNN Query

Now update the query assembly to handle vector search. When we have a vector, we use KNN (K-Nearest Neighbors) syntax to find the closest matches:

```typescript
let query: string
const options: any = { LIMIT: { from: 0, size: limit } }

if (vectorBuffer) {
  query = `(${textQuery})=>[KNN ${limit} @embedding $vec]`

  options.PARAMS = { vec: vectorBuffer }
  options.SORTBY = { BY: '__embedding_score', DIRECTION: 'ASC' }
} else {
  query = textQuery
  options.SORTBY = { BY: 'date', DIRECTION: 'DESC' }
}
```

This replaces the simpler query assembly from the previous step. Let's unpack the vector branch:

### The Query String

```
(${textQuery})=>[KNN ${limit} @embedding $vec]
```

This is a filtered vector query. It narrows down the candidates with structured filters before running the vector search:

- **`(${textQuery})`** — The structured filter in parentheses. This could be `(*)` (everything) or `(@topics:{AI} @source:{TechCrunch})` (filtered). Only documents matching this filter are candidates for the vector search.
- **`=>`** — The "pre-filter" operator. It says: "first filter by the left side, then apply the right side to the results."
- **`[KNN ${limit} @embedding $vec]`** — Find the `limit` nearest neighbors in the `@embedding` field, compared to the vector `$vec`. KNN stands for K-Nearest Neighbors.

So the full query says: "Among documents matching the structured filters, find the K most similar to my query vector."

If no structured filters were set, `textQuery` is `*`, and the query becomes `(*)=>[KNN 5 @embedding $vec]`—vector search across all documents.

### The Options

- **`PARAMS: { vec: vectorBuffer }`** — Passes the query vector as a parameter. The `$vec` in the query string references this. Using parameters (instead of inlining the vector) is required by Redis.
- **`SORTBY: { BY: '__embedding_score', DIRECTION: 'ASC' }`** — Sort by vector similarity score. The `__embedding_score` field is automatically added by Redis to KNN results—it's the distance between the query vector and each document's vector. Lower is more similar (since we're using COSINE distance), so we sort ascending.

Notice the contrast with the non-vector path, which sorts by `date` descending (newest first). With vector search, relevance replaces recency.

> **A Note on `FT.HYBRID`:** Redis 8.4 introduced a dedicated [`FT.HYBRID`](https://redis.io/docs/latest/commands/ft.hybrid/) command for true hybrid search. Unlike our pre-filter approach—where structured filters narrow the candidates _before_ KNN runs—`FT.HYBRID` runs a full-text search and a vector similarity search **independently**, then fuses their results using either Reciprocal Rank Fusion (RRF) or a linear combination of scores. This is useful when you want to blend keyword relevance and semantic relevance into a single ranked result set. We chose the simpler `FT.SEARCH` pre-filter syntax because our use case is straightforward: filter first, then rank by similarity. But if you need to balance two different notions of relevance, `FT.HYBRID` is worth exploring.

## Try It Out

Restart the server and open the app. The search panel now supports semantic queries in addition to the structured filters you built in the previous step.

Try these searches:

- Type a natural language query like "artificial intelligence breakthroughs" in the semantic search box and click search—you should get articles related to AI, even if they don't contain those exact words
- Try "climate change policy"—articles about environmental regulations, carbon emissions, or sustainability should appear
- Combine a semantic query with a structured filter—search for "space exploration" but only from a specific source
- Compare: search for a topic by selecting the TAG filter vs. typing it as a semantic query—notice how the TAG filter gives exact matches while the semantic search finds conceptually related articles

The semantic search results are sorted by relevance (most similar first) rather than date (newest first). This is the key difference—structured search answers "what matches these criteria?" while semantic search answers "what's most similar to this concept?"

## What You've Built

Over these three steps, you've built a complete search system:

1. **A search index** that tells Redis how to index your JSON documents—with TAG fields for categories, NUMERIC fields for ranges, and VECTOR fields for semantic similarity.
2. **Structured queries** that filter by exact tags (AND and OR logic) and date ranges.
3. **Semantic queries** that find articles by meaning using vector similarity, optionally combined with structured filters.

This is the same pattern used in production RAG (Retrieval-Augmented Generation) systems—and you'll use it in the next stage when the chatbot needs to find relevant articles to answer questions.
