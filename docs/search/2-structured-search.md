# Structured Search

Now that you have a search index, it's time to query it. In this step, you'll build structured queries using TAG and NUMERIC filters—the "database-style" side of search. You'll filter articles by topic, entity, source, and date range using Redis Search's query syntax.

## Files You'll Work In

| File                                          | What It Does                            |
| --------------------------------------------- | --------------------------------------- |
| `services/article-service/article-service.ts` | Build query filters in `searchArticles` |

## The Search Function

Open `services/article-service/article-service.ts` and find the `searchArticles` function. It takes a `SearchCriteria` object and a `limit`, and returns a `SearchResponse`. The criteria object has optional fields for sources, topics, people, organizations, locations, date range, and a semantic query. In this step, we'll handle everything except the semantic query.

The strategy is straightforward: build an array of query parts (one per filter), then join them into a single query string. If no filters are selected, we'll search for everything.

You'll see `queryParts`—an empty string array—already declared at the top of the function. This is where we'll accumulate each filter clause.

We'll also need a helper to escape special characters in TAG values. Characters like `{`, `}`, `-`, and `.` have special meanings in Redis Search query syntax, so if a tag value contains them (and entity names often do—think "U.S." or "Johnson & Johnson"), they need to be escaped:

```typescript
const escapeTag = (tag: string) => tag.replace(/[-\\,.<>{}[\]"':;!@#$%^&*()+=]/g, '\\$&')
```

This is the same idea as escaping SQL special characters—preventing values from being interpreted as syntax. The `escapeTag` function is already provided in the code, similar to how `extractTextFromHtml` was provided in Stage 1.

## TAG Filters: Topics, People, Organizations, Locations

TAG queries use the syntax `@fieldName:{value}`. When you put multiple TAG filters in the same query string separated by spaces, they're combined with AND logic—an article must match **all** of them.

Add the TAG filters for topics, people, organizations, and locations:

```typescript
if (criteria.topics) criteria.topics.forEach(tag => queryParts.push(`@topics:{${escapeTag(tag)}}`))
if (criteria.people) criteria.people.forEach(tag => queryParts.push(`@people:{${escapeTag(tag)}}`))
if (criteria.organizations) criteria.organizations.forEach(tag => queryParts.push(`@organizations:{${escapeTag(tag)}}`))
if (criteria.locations) criteria.locations.forEach(tag => queryParts.push(`@locations:{${escapeTag(tag)}}`))
```

Each line checks if the criteria has values for that field, then loops over them with `forEach`. For each tag, it escapes special characters and pushes a `@field:{value}` clause into `queryParts`. So if the user selects topics "AI" and "Technology", the array gets two entries: `@topics:{AI}` and `@topics:{Technology}`. Since parts are space-separated (AND) when joined, this finds articles tagged with **both** topics.

## TAG Filters: Sources (OR Logic)

Sources work differently. When the user selects multiple sources, they want articles from **any** of those sources—not articles that somehow came from all of them (which makes no sense since each article has exactly one source).

TAG syntax supports OR within a single filter using `|`:

```typescript
if (criteria.sources && criteria.sources.length > 0) {
  const sourceTags = criteria.sources.map(escapeTag).join('|')
  queryParts.push(`@source:{${sourceTags}}`)
}
```

The `map(escapeTag)` escapes each source name, then `join('|')` combines them with the OR delimiter. If the user selects "TechCrunch" and "Ars Technica", `sourceTags` becomes `TechCrunch|Ars Technica`, and the final clause is `@source:{TechCrunch|Ars Technica}`—match articles from **either** source. Note how this is a single query part with `|` inside the braces, compared to the multiple separate parts used for AND logic above.

## NUMERIC Filter: Date Range

NUMERIC fields use range syntax with square brackets: `@field:[min max]`. Redis supports `-inf` and `+inf` for open-ended ranges.

```typescript
if (criteria.startDate || criteria.endDate) {
  const start = criteria.startDate ?? '-inf'
  const end = criteria.endDate ?? '+inf'
  queryParts.push(`@date:[${start} ${end}]`)
}
```

If the user sets only a start date, the end defaults to `+inf` (everything from that date forward). Only an end date? The start defaults to `-inf` (everything up to that date). Both? A closed range. Neither? This block doesn't run and no date filter is added.

The `startDate` and `endDate` values are Unix timestamps in seconds, matching the `publicationDate` field you indexed as NUMERIC.

## Assembling the Query

Now join the parts into a single query string. If no filters were selected, use `*` to match everything:

```typescript
const textQuery = queryParts.length > 0 ? queryParts.join(' ') : '*'
```

A complete query might look like: `@topics:{AI} @source:{TechCrunch|Ars Technica} @date:[1700000000 +inf]`. Each part is space-separated, which Redis interprets as AND. So this finds articles about AI, from TechCrunch or Ars Technica, published after the given timestamp.

## Calling `ft.search`

Now execute the search with `redis.ft.search`:

```typescript
const query = textQuery
const options: any = {
  LIMIT: { from: 0, size: limit },
  SORTBY: { BY: 'date', DIRECTION: 'DESC' }
}

const result = (await redis.ft.search(INDEX_NAME, query, options)) as {
  total: number
  documents: { id: string; value: any }[]
}
```

`redis.ft.search` takes the index name, the query string, and options. The result contains `total` (the number of matching documents) and `documents` (an array of matches). Each document has an `id` (the Redis key) and `value` (the JSON document).

The `LIMIT` option works like SQL's `LIMIT`—`from` is the offset, `size` is the count. `SORTBY` sorts results by the `date` field in descending order (newest first).

## Mapping Results

The raw search results include the full JSON document. Map them to the `SearchedArticle` shape that the frontend expects:

```typescript
const articles = result.documents.map((doc: any) => ({
  id: doc.value.id ?? '',
  title: doc.value.title ?? '',
  link: doc.value.link ?? '',
  content: doc.value.content ?? '',
  summary: doc.value.summary ?? '',
  source: doc.value.source?.title ?? '',
  publicationDate: doc.value.publicationDate ?? 0,
  topics: doc.value.topics ?? [],
  namedEntities: {
    people: doc.value.namedEntities?.people ?? [],
    organizations: doc.value.namedEntities?.organizations ?? [],
    locations: doc.value.namedEntities?.locations ?? []
  }
}))

return { success: true, articles }
```

Notice `source: doc.value.source?.title ?? ''`—the stored document has `source` as an object with `title` and `link`, but the search result flattens it to just the title string. The `??` operators provide fallbacks for any missing fields.

The function is wrapped in a try/catch that returns `{ success: false, error: String(error) }` on failure. This is already in place in the code.

## Try It Out

Restart the server and open the app. Click the **Search** tab. You should see filter controls for sources, topics, people, organizations, locations, and date range.

Try a few searches:

- Select a topic and click search—you should see only articles with that topic
- Select multiple topics—results should have **all** selected topics (AND logic)
- Select a source or two—results should come from **any** selected source (OR logic)
- Set a date range—results should fall within that window
- Combine filters—try a topic plus a source plus a date range

If you have no results, make sure you've ingested articles first (Stage 1) and that the index was created (check the server terminal output).

Next: [Semantic Search](3-semantic-search.md)
