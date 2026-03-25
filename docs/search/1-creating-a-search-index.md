# Creating a Search Index

In Stage 1, you stored articles as JSON documents in Redis. Each document has fields like `title`, `topics`, `namedEntities.people`, `publicationDate`, and `embedding`. Right now, the only way to retrieve an article is by its exact key. To search across all articles—filtering by topic, finding articles about a specific person, or searching by meaning—you need a **search index**.

## How Redis Search Works

Redis Search is a search engine built directly into Redis. Unlike external search engines (Elasticsearch, Solr), there's no separate service to run, no data to sync, and no replication lag. Your JSON documents are already in Redis—Redis Search indexes them in place.

Here's the key idea: you define an index that tells Redis which fields to index and how to treat them. Redis then watches for any JSON documents that match the index's key prefix and automatically indexes them. Documents you've already stored get indexed immediately. New documents get indexed as they arrive. Delete a document and it disappears from the index. No manual syncing required.

## Files You'll Work In

| File                                          | What It Does                 |
| --------------------------------------------- | ---------------------------- |
| `services/article-service/article-service.ts` | Add the index creation logic |

## The Index Function

Open `services/article-service/article-service.ts` and find the `createIndex` function. It's called automatically when the module loads (look for `await createIndex()` near the top of the file). Right now, the function has some scaffolding—a call to `fetchEmbeddingDims()` and some logging—but the actual index creation logic is missing. You'll fill it in.

The function also needs to be idempotent. If the index already exists, it should skip creation. Redis will throw an error if you try to create an index that already exists, and since this runs every time the server starts, you need to handle that.

### Checking for an Existing Index

Add the following code to the `createIndex` function. It lists all existing indexes and returns early if ours is already there:

```typescript
const indexes = await redis.ft._list()

if (indexes.includes(INDEX_NAME)) {
  console.log(`Index ${INDEX_NAME} already exists`)
  return
}
```

`redis.ft._list()` returns an array of all index names. If our index is in the list, we're done. The `INDEX_NAME` constant is already defined at the top of the file—`news:aggregator:article:index`.

### Creating the Index

Now for the index itself. The `redis.ft.create` call takes three arguments: the index name, a schema defining which fields to index, and options that tell Redis where to find the documents.

You'll see a call to `fetchEmbeddingDims()` and some logging already in place. The `embeddingDimensions` variable will be used later when we define the vector field.

Between the logging lines, add the call to `redis.ft.create`. We'll start with an empty schema and fill it in afterward:

```typescript
await redis.ft.create(
  INDEX_NAME,
  {
    // We'll add fields here
  },
  { ON: 'JSON', PREFIX: KEY_PREFIX }
)
```

The third argument—`{ ON: 'JSON', PREFIX: KEY_PREFIX }`—tells Redis two things: index JSON documents (not hash keys), and only index documents whose keys start with `news:aggregator:article:`. This is how Redis knows which documents belong to this index.

Now let's fill in the schema, one field type at a time.

## TAG Fields

A TAG field indexes discrete values—think categories, labels, or identifiers. They're typically queried with exact matches, though they also support prefix and suffix matching. We'll stick with exact matches here. They're perfect for fields like topics, entity names, and source names.

Add the TAG fields to the schema:

```typescript
'$.source.title': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'source' },
'$.topics[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'topics' },
'$.namedEntities.people[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'people' },
'$.namedEntities.organizations[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'organizations' },
'$.namedEntities.locations[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'locations' },
```

Each entry maps a JSONPath expression to a field type. Let's break down what's happening:

- **`'$.source.title'`** — a JSONPath pointing to a single string value nested inside the `source` object. The `AS: 'source'` gives it a short alias for queries.
- **`'$.topics[*]'`** — the `[*]` means "every element in this array." Redis indexes each topic string individually, so an article with `["Technology", "AI"]` is findable by either tag.
- **`'$.namedEntities.people[*]'`** — same pattern, reaching into a nested object and then into an array.

The `AS` alias is important—it's the name you'll use when writing queries. Without it, you'd have to use the full JSONPath in every query. You'll query TAG fields with syntax like `@topics:{AI}` to find articles tagged with "AI".

## NUMERIC Fields

A NUMERIC field indexes numbers and supports range queries—greater than, less than, between. Perfect for dates, counts, or scores.

Add the date field:

```typescript
'$.publicationDate': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'date' },
```

Remember from Stage 1 that `publicationDate` is a Unix timestamp in seconds. NUMERIC fields work with any number—integers or floats—so Unix timestamps work naturally. You'll query this with range syntax like `@date:[1700000000 1710000000]` to find articles published in a time window.

## Other Field Types

Redis Search supports several other field types that we won't use in this workshop, but are worth knowing about:

- **TEXT** — Full-text search with stemming, phonetic matching, and relevance scoring. Use it when you want to search _within_ text content (like searching article bodies for keywords). We're using TAG fields instead because our filters are exact-match categories, not free-text search.
- **GEO** — Geographic coordinates (longitude/latitude). Supports radius queries like "find all articles within 50km of San Francisco." Useful if your data has location coordinates.

You can read more about all the available field types in the [Redis Search documentation](https://redis.io/docs/latest/develop/interact/search-and-query/basic-constructs/field-and-type-options/).

## VECTOR Fields

The most interesting field type for AI applications. A VECTOR field indexes arrays of floating-point numbers—the embeddings you generated in Stage 1. This enables **semantic search**: finding articles by meaning rather than exact keywords.

Add the vector field:

```typescript
'$.embedding': {
  type: SCHEMA_FIELD_TYPE.VECTOR,
  AS: 'embedding',
  ALGORITHM: SCHEMA_VECTOR_FIELD_ALGORITHM.FLAT,
  TYPE: 'FLOAT32',
  DIM: embeddingDimensions,
  DISTANCE_METRIC: 'COSINE'
}
```

Vector fields have more configuration than TAG or NUMERIC fields. Here's what each option means:

- **`ALGORITHM: FLAT`** — The indexing algorithm. FLAT does an exact brute-force comparison against every vector. It's simple and accurate. The alternatives are `HNSW` (Hierarchical Navigable Small World), which builds a graph structure for approximate nearest-neighbor search, and `SVS-VAMANA`, which is optimized for both memory efficiency and speed using vector quantization. Both HNSW and SVS-Vamana are faster for large datasets (millions of vectors) but return approximate results. For a workshop with hundreds or thousands of articles, FLAT is the right choice.
- **`TYPE: 'FLOAT32'`** — The numeric type of each vector element. FLOAT32 is standard for most embedding models. FLOAT64 offers more precision but doubles memory usage. BFLOAT16 halves memory at the cost of some precision.
- **`DIM: embeddingDimensions`** — The number of dimensions in each vector. This must match the embedding model's output. Our model (`text-embedding-3-small`) produces 1536-dimensional vectors, so every vector in the index must have exactly 1536 elements.
- **`DISTANCE_METRIC: 'COSINE'`** — How similarity is measured between vectors. COSINE measures the angle between vectors—two vectors pointing in the same direction have a cosine similarity near 1, regardless of their magnitude. This is the most common choice for text embeddings. Other options are `L2` (Euclidean distance—straight-line distance in vector space) and `IP` (inner product—similar to cosine but sensitive to magnitude).

### A Quick Note on Vector Search

If you haven't worked with vector search before, here's the intuition: embedding models convert text into a point in high-dimensional space. Texts with similar meanings end up near each other. The points for "Apple releases new iPhone" and "Apple launches latest smartphone" would be close together, even though they share few exact words. "Apple pie recipe" would be far away.

When you search, you convert your query into a vector using the same embedding model, then find the stored vectors closest to it. That's what the VECTOR field enables—Redis stores the vectors and can efficiently find the nearest neighbors.

## The Complete Schema

Your finished `createIndex` function should look like this:

```typescript
async function createIndex(): Promise<void> {
  const indexes = await redis.ft._list()

  if (indexes.includes(INDEX_NAME)) {
    console.log(`Index ${INDEX_NAME} already exists`)
    return
  }

  const embeddingDimensions = fetchEmbeddingDims()

  console.log(`Creating index ${INDEX_NAME}`)

  await redis.ft.create(
    INDEX_NAME,
    {
      '$.source.title': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'source' },
      '$.publicationDate': { type: SCHEMA_FIELD_TYPE.NUMERIC, AS: 'date' },
      '$.topics[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'topics' },
      '$.namedEntities.people[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'people' },
      '$.namedEntities.organizations[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'organizations' },
      '$.namedEntities.locations[*]': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'locations' },
      '$.embedding': {
        type: SCHEMA_FIELD_TYPE.VECTOR,
        AS: 'embedding',
        ALGORITHM: SCHEMA_VECTOR_FIELD_ALGORITHM.FLAT,
        TYPE: 'FLOAT32',
        DIM: embeddingDimensions,
        DISTANCE_METRIC: 'COSINE'
      }
    },
    { ON: 'JSON', PREFIX: KEY_PREFIX }
  )

  console.log(`Index ${INDEX_NAME} created`)
  console.log(
    'NOTE: If you change the index in code, you must delete the index in Redis CLI with:',
    `FT.DROPINDEX ${INDEX_NAME}`
  )
}
```

> **Important:** If you need to change the index schema later, you must first drop the existing index. Redis won't let you modify an index in place. Use the Redis Insight CLI: `FT.DROPINDEX news:aggregator:article:index`. The underlying JSON documents are not affected—only the index is removed. When the server restarts, it will recreate the index with the new schema.

## Try It Out

Restart the server. In the terminal output, hit **Ctrl+C** to stop the server, then run `npm run dev` to start it again. You should see `Creating index news:aggregator:article:index` followed by `Index ... created`. If you restart again, you'll see `Index ... already exists`—the idempotency check is working.

If you already ingested articles in Stage 1, they're automatically indexed. If not, click **Ingest** to add some articles first. The index watches for documents with the right key prefix and indexes them as they arrive.

You can verify the index exists in Redis Insight. Open the CLI (Workbench tab) and run:

```redis
FT.INFO news:aggregator:article:index
```

You'll see the full index definition—field names, types, and options. The `num_docs` field tells you how many documents are indexed.

Next: [Structured Search](2-structured-search.md)
