# Storing Articles in Redis

Your workflow produces complete articles, and the UI shows them—but they aren't actually saved anywhere yet. We won't be able to search for them or chat about them until we store them in Redis. The ingestion loop in `ingest.ts` already calls `saveArticle()`, but the function doesn't persist anything yet. Time to fix that.

This step is light on code—just two lines—but it's a good chance to understand how Redis stores JSON and how to explore your data.

## Files You'll Work In

| File                                          | What It Does                             |
| --------------------------------------------- | ---------------------------------------- |
| `services/article-service/article-service.ts` | Add the Redis save call to `saveArticle` |

## The Redis Connection

At the top of `article-service.ts` you'll see `fetchRedisConnection()`—same pattern as `fetchLLM()`. It lives in `adapters/redis-adapter.ts` and returns a shared, connected Redis client. Dig in if you want the details.

## Redis and JSON

You might know Redis as a key-value store for strings, but Redis has native support for JSON documents. The `JSON.SET` command stores a full JSON object at a key, and `JSON.GET` retrieves it—no serialization or deserialization on your side. Redis parses and stores the JSON structure internally.

## Saving the Article

Open `services/article-service/article-service.ts` and find the `saveArticle` function. The ID generation and the return are already there—the ID is a truncated SHA-1 hash of the article's link, so the same URL always gets the same key. Take a look at `generateArticleId` if you want to see how it works.

You need to add two lines in the middle—build the key and write the JSON:

```typescript
const key = `${KEY_PREFIX}${id}`
await redis.json.set(key, '$', articleWithId as any)
```

The key uses a prefix (`news:aggregator:article:`) followed by the article's ID, giving each article a unique key in Redis. The `redis.json.set` call stores the entire article object as a JSON document at that key. The `'$'` is a JSONPath expression meaning "the root of the document"—you're setting the whole thing. More on JSONPath in a moment.

That's it. Two lines. The article is now persisted in Redis.

## Try It Out

Click **Ingest** again (small limit). This time the articles are saved to Redis. Let's look in Redis and see them.

### Opening Redis Insight

To see your data, we'll use Redis Insight. If you don't have it open already, in the workbench, click the humburger menu on the top left and select **Redis Insight** in the menu. This will make the Redis Insight panel visible. You can always open in in a new tab from there if the panel is too small. If this is your first time opening it, you may need to accept a EULA.

### Browsing Your Data

In Redis Insight, you will be presented a list of databases you can connect to. There's only one named **Workshop Redis**. Click it. You should see a list of JSON keys on the left panel of Redis Insight. At the top of this panel you can toggle between a list view and a tree view. Play around with that and find a JSON key that starts with `news:aggregator:article:` and click on it. You will see the full JSON document—the article with all its fields: title, content, summary, topics, named entities, embedding, and everything else the workflow produced.

You may need to click the **refresh** button in the top-right to see newly ingested keys.

### Exploring with JSONPath

Redis Insight also has a CLI. Click **Workbench** near the top of the two panels. It will be after **Browse**, which is currently selected, and before **Analyze** and **Pub/Sub**.

Get a full article using the command below and by clicking Run or by pressing `Ctrl+Enter`. Use any key you see in the browser:

```redis
JSON.GET news:aggregator:article:<some-id>
```

That's a lot of data. Remember the `$` from `redis.json.set`? That was JSONPath for "the root." You can use JSONPath with `JSON.GET` too, to reach into the document. Get just the topics:

```redis
JSON.GET news:aggregator:article:<some-id> $.topics
```

Or pull out all the people mentioned in an article:

```redis
JSON.GET news:aggregator:article:<some-id> $.namedEntities.people
```

JSONPath works like a query language for your JSON documents. The `$` is the root, and you dot into nested fields just like JavaScript. This is the same structure your workflow built—`namedEntities.people` maps directly to the entity extractor's output.

## What's Next

The ingestion pipeline is complete. Articles flow from RSS feeds through text extraction, summarization, topic classification, entity extraction, and embedding—then get assembled and saved to Redis as searchable JSON documents.

You're done with Stage 1. Next up: building the search and chat features that make use of all this data in [Stage 2: Article Search](/search/0-overview.md).
