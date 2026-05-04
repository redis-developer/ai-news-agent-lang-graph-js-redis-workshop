---
marp: true
theme: redis
paginate: false
transition: dissolve
style: |
  @keyframes marp-outgoing-transition-dissolve {
    from { opacity: 1; }
    to { opacity: 1; }
  }
  @keyframes marp-incoming-transition-dissolve {
    from { opacity: 0; }
    to { opacity: 1; }
  }
---

<!-- _class: title hyper -->

# Build your own AI news agent

## with Redis + LangGraph.js

- Guy Royse

---

<!-- _class: speaker dark -->

![](images/guy-royse.jpg)

# Guy Royse

## Senior Developer Advocate, Redis

---

<!-- _class: speaker dark -->

![](images/guy-royse.jpg)

# Guy Royse

## Senior Developer Advocate, Redis

## Socials

![h:30 w:30](images/logos/twitter-yellow.svg) @guyroyse

![h:30 w:30](images/logos/github-yellow.svg) github.com/guyroyse

![h:30 w:30](images/logos/bluesky-yellow.svg) @guy.dev

![h:30 w:30](images/icons/link-yellow.svg) guy.dev

---

<!-- _class: blank dark no-logo -->

![bg brightness:0.65](images/backgrounds/small-world.jpg)

---

<!-- _class: hero dark no-logo -->

![bg brightness:0.65](images/backgrounds/small-world.jpg)

# AI is changing everything

---

<!-- _class: blank light -->

![bg left:50%](images/backgrounds/robot-dark-background.jpg)

---

<!-- _class: blank light -->

![bg left:50%](images/backgrounds/robot-dark-background.jpg)

Building apps with AI.

&nbsp;

---

<!-- _class: blank light -->

![bg left:50%](images/backgrounds/robot-dark-background.jpg)

Building apps with AI.

Build apps that **_use_** AI.

---

<!--  _class: centered-images dark -->

# Tools we're using today

![h:175](images/logos/openai-white.svg)
![h:125](images/logos/typescript.svg)
![h:125](images/logos/langgraph-white.svg)
![h:125](images/logos/redis-mark-hyper.svg)

---

<!--  _class: content dark -->

# LangGraph.js

## &nbsp;

![bg right w:400](images/logos/langgraph-white.svg)

Workflow Orchestration

- Graph-based
- Nodes define the work
- Edges define the flow

Custom Annotations

- Define the state the workflow updates

---

<!--  _class: content dark -->

# Redis

## &nbsp;

![bg right w:400](images/logos/redis-logo-hyper.svg)

### ![h:50](images/icons/redis-search-white.svg) &nbsp;&nbsp; Redis Search

### ![h:50](images/icons/semantic-search-white.svg) &nbsp;&nbsp; Semantic Search

### ![h:50](images/icons/agent-memory-server-white.svg) &nbsp;&nbsp; Agent Memory Server

---

<!-- _class: hero dark -->

# What are we building today?

---

<!-- _class: blank dark no-logo-->

![bg](images/app-snapshot.png)

---

<!-- _class: content dark -->

# Four workflows

## From raw feeds to personalized briefs

1. **Ingest** — Process RSS feeds into enriched articles
2. **Search** — Find articles by topic, entity, or meaning
3. **Chat** — Converse about the news with memory
4. **Brief** — Generate personalized news summaries

---

<!-- _class: hero hyper -->

# Let's get set up

---

<!-- _class: content dark -->

# Two options

## &nbsp;

### Option A: Remote virtual environment

- No install needed
- Scan the QR code and follow the instructions

&nbsp;

### Option B: Local Docker environment

- Runs locally in Docker
- Clone the repo and run `docker compose up`

---

<!-- _class: centered-content dark -->

# Remote virtual environment

## Scan the QR code

![w:175](images/virtual-env-signup-qr-code.png)

&nbsp;

### Follow the instructions to get your environment set up.

You will be asked for you email address.
You'll be emailed a link to your environment so don't lie.

---

<!-- _class: centered-content dark -->

# Local Docker environment

## Clone this if you're using Docker

![w:175](images/workshop-repo-qr-code.png)

&nbsp;

```bash
$ git clone git@github.com:redis-developer/
            ai-news-agent-lang-graph-js-redis-workshop.git
$ docker compose up -d
```

### Open `localhost` in your browser.

---

<!-- _class: centered-content dark -->

# The cheat code

## If you get stuck...

![w:175](images/solution-repo-qr-code.png)

&nbsp;

`github.com/redis-developer/ai-news-agent-lang-graph-js-redis-demo`

---

<!-- _class: blank dark -->

![bg](images/workshop-snapshot.png)

---

<!-- SECTION: Stage 1 — Feed Ingestion -->
<!-- =================================== -->

<!-- _class: hero hyper -->

# Stage 1: Feed Ingestion

---

<!-- _class: content dark -->

# What We're Building

## An ingestion pipeline

- Fetch RSS feeds
- Extract clean text from HTML
- Summarize, classify topics, extract entities
- Generate vector embeddings
- Assemble and store in Redis

---

<!-- _class: centered-content dark -->

# The Final Graph

## What you'll build by the end of Stage 1

<!-- TODO: Replace with diagram image of the full ingestion graph -->

![w:800](https://picsum.photos/800/300)

---

<!-- _class: hero dark -->

# LangGraph.js Basics

---

<!-- _class: content dark -->

# How LangGraph.js Works

## Four steps to every workflow

1. Define a **state** — the data flowing through the graph
2. Write **nodes** — functions that transform state
3. Connect with **edges** — define execution order
4. **Compile** and **invoke**

---

<!-- _class: hero dark -->

# The simplest graph

---

<!-- _class: centered-content dark -->

# A single node

## START → text-extractor → END

<!-- TODO: Replace with diagram -->

![w:600](https://picsum.photos/600/200)

---

<!-- _class: content dark -->

# Defining state

## `Annotation.Root()` defines the shape

```typescript
export const ArticleAnnotation = Annotation.Root({
  feedItem: Annotation<FeedItem>(),
  content: Annotation<string>(),
  article: Annotation<ArticleData>()
})
```

- Each field is a slot in the shared state
- Nodes read from and write to these slots

---

<!-- _class: content dark -->

# Writing a node

## Functions that transform state

```typescript
async function textExtractor(state: ArticleState): Promise<Partial<ArticleState>> {
  const { feedItem } = state

  const text = extractTextFromHtml(feedItem.html)
  const prompt = buildPrompt(text)
  const response = await llm.invoke(prompt)

  return { content: response.content as string }
}
```

- Takes full state in, returns partial state out
- LangGraph.js merges the return into shared state

---

<!-- _class: content dark -->

# Wiring the graph

## Nodes + edges + compile

```typescript
const graph = new StateGraph(ArticleAnnotation)

graph.addNode('text-extractor', textExtractor)

graph.addEdge(START, 'text-extractor')
graph.addEdge('text-extractor', END)

const workflow = graph.compile()
```

- Add nodes
- Connect with edges
- Compile

---

<!-- _class: content dark -->

# Invoking the workflow

## Compile once, invoke many times

```typescript
const initialState = { feedItem }
const finalState = await articleWorkflow.invoke(initialState)
console.log(finalState.article)
```

- Pass initial state to `invoke()`
- Get final state back when the graph completes

---

<!-- _class: hero dark -->

# Multi-node graphs

---

<!-- _class: centered-content dark -->

# Adding the summarizer

## START → text-extractor → summarizer → END

<!-- TODO: Replace with diagram -->

![w:700](https://picsum.photos/700/200)

---

<!-- _class: content dark -->

# The Summarizer Node

## Same pattern as the text extractor

```typescript
async function summarizer(state: ArticleState): Promise<Partial<ArticleState>> {
  const { content } = state

  const prompt = buildPrompt(content)
  const response = await llm.invoke(prompt)

  return { summary: response.content as string }
}
```

- Reads `content` written by the text extractor
- Writes `summary` back to state

---

<!-- _class: content dark -->

# Sequential chaining

## One node's output is the next node's input

```typescript
graph.addNode('text-extractor', textExtractor)
graph.addNode('summarizer', summarizer)

graph.addEdge(START, 'text-extractor')
graph.addEdge('text-extractor', 'summarizer')
graph.addEdge('summarizer', END)
```

- Text extractor writes `content` to state
- Summarizer reads `content` from state

---

<!-- _class: hero dark -->

# Structured output

---

<!-- _class: content dark -->

# The problem with unstructured text

## LLMs return strings — but you need data

- "The topics are Technology, AI, and Business" — now what?
- Parse it? Regex? Hope for the best?
- What if the LLM changes its formatting?

---

<!-- _class: content dark -->

# Structured output

## Get validated JSON back from the LLM

Define a schema with Zod:

```typescript
const topicsSchema = z.object({
  topics: z.array(z.string()).describe('Broad topics for the article')
})
```

- `.describe()` tells the LLM what each field means
- Must be an object at the top level

---

<!-- _class: content dark -->

# Using structured output

## Chain `.withStructuredOutput()` onto the LLM

```typescript
const llm = fetchLLM().withStructuredOutput(topicsSchema)
const result = await llm.invoke(prompt)

// result is { topics: string[] } — parsed and validated
result.topics // ["Technology", "Artificial Intelligence"]
```

- No parsing, no regex, no guessing
- The prompt describes _what_ to extract
- The schema describes the _shape_ of the response

---

<!-- _class: content dark -->

# The topic classifier node

## Structured output in action

```typescript
async function topicClassifier(state: ArticleState): Promise<Partial<ArticleState>> {
  const { feedItem, content } = state

  const prompt = buildPrompt(feedItem.title, content)
  const result = await llm.invoke(prompt)

  return { topics: result.topics }
}
```

- `llm` was created with `.withStructuredOutput(topicsSchema)`
- `result` is already `{ topics: string[] }` — no parsing needed

---

<!-- _class: hero dark -->

# Fan-out: Parallel processing

---

<!-- _class: centered-content dark -->

# Three branches from text-extractor

## Summarizer, topic classifier, entity extractor — all at once

<!-- TODO: Replace with fan-out diagram -->

![w:800](https://picsum.photos/800/300)

---

<!-- _class: content dark -->

# Fan-out is just multiple edges

## Three edges from one node → runs all three **in parallel**

```typescript
...
graph.addNode('text-extractor', textExtractor)
graph.addNode('summarizer', summarizer)
graph.addNode('topic-classifier', topicClassifier)
graph.addNode('entity-extractor', entityExtractor)

graph.addEdge(START, 'text-extractor')
graph.addEdge('text-extractor', 'summarizer')
graph.addEdge('text-extractor', 'topic-classifier')
graph.addEdge('text-extractor', 'entity-extractor')
...
```

- Runs all three nodes **in parallel**

---

<!-- _class: content dark -->

# State with reducers

## How parallel writes merge

```typescript
topics: Annotation<string[]>({
  default: () => [],
  reducer: (prev, next) => [...prev, ...next]
})
```

- **`default`** — initial value
- **`reducer`** — how to merge (concatenate arrays)
- Without a reducer, last write wins

---

<!-- _class: hero dark -->

# Embeddings

---

<!-- _class: content dark -->

# What are embeddings?

## Numbers that capture meaning

- Unstructured data converted to a vector
- Essentially just coordinates in a high-dimensional space
- Nearby points have similar meanings
- Farther away points have dissimilar meanings

<!-- TODO: Replace with vector space diagram showing clustered points -->

## ![bg right:50%](https://picsum.photos/700/400)

---

<!-- _class: content dark -->

# The embedder node

## Same pattern but no LLM

```typescript
async function embedder(state: ArticleState): Promise<Partial<ArticleState>> {
  const { feedItem, summary } = state

  const textToEmbed = `${feedItem.title}\n\n${summary}`
  const embedding = await embeddingModel.embedQuery(textToEmbed)

  return { embedding }
}
```

- Uses an **embedding model**, not a chat LLM

---

<!-- _class: hero dark -->

# Fan-in: Assembling the results

---

<!-- _class: centered-content dark -->

# All roads lead to the assembler

## Wait for all branches, then combine

<!-- TODO: Replace with full fan-in diagram -->

![w:800](https://picsum.photos/800/300)

---

<!-- _class: content dark -->

# Deferred nodes

## Waits for all incoming edges

```typescript
graph.addNode('article-assembler', articleAssembler, { defer: true })

graph.addEdge('topic-classifier', 'article-assembler')
graph.addEdge('entity-extractor', 'article-assembler')
graph.addEdge('embedder', 'article-assembler')

graph.addEdge('article-assembler', END)
```

- Without `defer`, it runs as soon as the first branch arrives
- With `defer`, it waits for **all** incoming edges

---

<!-- _class: hero dark -->

# Storing articles in Redis

---

<!-- _class: content dark -->

# Redis JSON

## Native JSON document storage

- Store, retrieve, and update JSON documents in Redis
- Every document lives at a **key** — just like any Redis value
- Access nested fields with **JSONPath** expressions

---

<!-- _class: content dark -->

# Setting and getting documents

## `JSON.SET` and `JSON.GET`

```bash
JSON.SET article:42 $ '{"title": "AI News", "topics": ["tech"]}'

JSON.GET article:42
# → {"title": "AI News", "topics": ["tech"]}
```

- `$` means "the root" of the document
- `JSON.SET` creates or overwrites the document at that key

---

<!-- _class: content dark -->

# JSONPath

## Reach into nested fields

```bash
JSON.GET article:42 $.title
# → ["AI News"]

JSON.GET article:42 $.topics
# → [["tech"]]

JSON.GET article:42 $.topics[0]
# → ["tech"]
```

- `$` = root, `.field` = property, `[n]` = array index
- Always returns an **array** of matches

---

<!-- _class: content dark -->

# In TypeScript

## The Node Redis client wraps these commands

```typescript
const key = `${KEY_PREFIX}${id}`
await redis.json.set(key, '$', article)

const doc = await redis.json.get(key)
const topics = await redis.json.get(key, { path: '$.topics' })
```

- `redis.json.set(key, path, value)` — store a document
- `redis.json.get(key)` — retrieve the whole document
- `redis.json.get(key, { path })` — retrieve a nested field

---

<!-- _class: hero dark -->

# Go do it!

---

<!-- SECTION: Stage 2 — Article Search -->
<!-- ================================== -->

<!-- _class: hero hyper -->

# Stage 2: Article search

---

<!-- _class: content dark -->

# Redis as a search engine

## Built into Redis — no external service

- Indexes JSON documents **in place**
- No data sync, no replication lag
- Watches for new documents automatically
- TAG, NUMERIC, TEXT, VECTOR, GEO field types

---

<!-- _class: hero dark -->

# Creating a search index

---

<!-- _class: centered-content dark -->

# Defining the schema

```typescript
await redis.ft.create(
  INDEX_NAME,
  {
    '$.source.title': { type: TAG, AS: 'source' },
    '$.topics[*]': { type: TAG, AS: 'topics' },
    '$.publicationDate': { type: NUMERIC, AS: 'date' },
    '$.embedding': {
      type: VECTOR,
      AS: 'embedding',
      ALGORITHM: FLAT,
      TYPE: 'FLOAT32',
      DIM: 1536,
      DISTANCE_METRIC: 'COSINE'
    }
  },
  { ON: 'JSON', PREFIX: KEY_PREFIX }
)
```

---

<!-- _class: content dark -->

# Field types

## Each serves a different query style

| Type        | Use Case            | Example                   |
| ----------- | ------------------- | ------------------------- |
| **TAG**     | Exact match         | `@topics:{AI}`            |
| **NUMERIC** | Ranges              | `@date:[1700000000 +inf]` |
| **VECTOR**  | Semantic similarity | KNN search                |
| **TEXT**    | Full-text search    | Stemming, phonetics       |
| **GEO**     | Radius queries      | By coordinates            |

---

<!-- _class: hero dark -->

# Structured Search

---

<!-- _class: content dark -->

# TAG queries

## Filter by exact values

```typescript
// AND logic — must match ALL
queryParts.push(`@topics:{AI}`)
queryParts.push(`@people:{Mark Zuckerberg}`)

// OR logic — match ANY
queryParts.push(`@source:{TechCrunch|Ars Technica}`)
```

---

<!-- _class: content dark -->

# NUMERIC queries

## Filter by ranges

```typescript
// Date range
queryParts.push(`@date:[${startDate} ${endDate}]`)

// Open-ended
queryParts.push(`@date:[${startDate} +inf]`)
```

---

<!-- _class: content dark -->

# Executing the search

## &nbsp;

```typescript
const query = queryParts.join(' ') // AND logic
const options = {
  LIMIT: { from: 0, size: limit },
  SORTBY: { BY: 'date', DIRECTION: 'DESC' }
}

const result = await redis.ft.search(INDEX_NAME, query, options)
```

---

<!-- _class: hero dark -->

# Semantic search

---

<!-- _class: centered-content dark -->

# Vector search

## Find articles by meaning, not keywords

<!-- TODO: Replace with vector space diagram -->

![w:600](https://picsum.photos/600/400)

---

<!-- _class: centered-content dark -->

# K-Nearest Neighbors

```typescript
// Embed the user's query
const embedding = await embedder.embedQuery(query)
const vectorBuffer = Buffer.from(new Float32Array(embedding).buffer)

// Combine structured + vector search
const structuredQuery = queryParts.join(' ')
const vectorQuery = `[KNN ${limit} @embedding $vec]`
const query = `(${textQuery})=>[${semanticQuery}]`

const options = {
  PARAMS: { vec: vectorBuffer },
  SORTBY: { BY: '__embedding_score', DIRECTION: 'ASC' },
  LIMIT: { from: 0, size: limit }
}

const result = await redis.ft.search(INDEX_NAME, query, options)
```

---

<!-- _class: hero dark -->

# Go do it!

---

<!-- SECTION: Stage 3 — Chatbot -->
<!-- =========================== -->

<!-- _class: hero hyper -->

# Stage 3: Chatbot

---

<!-- _class: centered-content dark -->

# The Chatbot Graph

## Three nodes in a line

<!-- TODO: Replace with chatbot graph diagram -->

![w:800](https://picsum.photos/800/200)

---

<!-- _class: content dark -->

# The three nodes

## Each has a specific job

- **prompt-enricher** — Fetch memories, build the prompt
- **tool-using-responder** — ReAct agent with search tool
- **memory-saver** — Save the exchange to AMS

---

<!-- _class: hero dark -->

# Tools & the ReAct agent

---

<!-- _class: content dark -->

# The ReAct pattern

## Reasoning + acting

1. **Reason** — What's being asked? What do I know?
2. **Act** — Call a tool to get new information
3. **Observe** — Read the result
4. **Repeat** — Until satisfied
5. **Respond** — Generate the final answer

![bg right:50%](https://picsum.photos/600/250)

<!-- TODO: Replace with ReAct loop diagram -->

---

<!-- _class: content dark -->

# What's a tool?

## A function the LLM can call

```typescript
const searchArticlesTool = tool(searchArticles, {
  name: 'search_articles',
  description: 'Search for news articles...',
  schema: z.object({
    semanticQuery: z.string().optional().describe('Natural language search query'),
    topics: z.array(z.string()).optional().describe('Filter by topics')
    // ...more fields
  })
})
```

---

<!-- _class: content dark -->

# ReAct Agents in LangGraph.js

## Builds the loop for you (but only for tools)

```typescript
const llm = fetchLargeLLM()
const tools = [searchArticlesTool]

const reactAgent = createReactAgent({
  llm,
  tools,
  messageModifier: new SystemMessage(buildPrompt())
})
```

- Give it an LLM, tools, and a system message
- It handles the reason → act → observe loop

---

<!-- _class: hero dark -->

# Agent Memory Server

---

<!-- _class: content dark -->

# Two types of memory

## Working memory + long-term memory

### Working wemory

- Conversation history per session
- Auto-summarizes when it gets long

### Long-term memory

- Facts and preferences extracted automatically
- Persists across sessions
- Retrieved by semantic similarity

---

<!-- _class: content dark -->

# The working memory API

## REST endpoints on Agent Memory Server

```
GET  /v1/working-memory/{sessionId}    → fetch conversation
PUT  /v1/working-memory/{sessionId}    → replace conversation
DELETE /v1/working-memory/{sessionId}  → clear conversation
```

- PUT replaces the **entire** message list — not an append
- AMS auto-summarizes and extracts long-term memories on PUT

---

<!-- _class: content dark -->

# Saving memory

## The memory-saver node

```typescript
const workingMemory = await fetchWorkingMemory(sessionId)
const existingMessages = workingMemory?.messages ?? []

const updatedMessages = [
  ...existingMessages,
  { role: 'user', content: userMessage },
  { role: 'assistant', content: responseMessage }
]

await updateWorkingMemory(sessionId, { messages: updatedMessages })
```

- Fetch existing messages first, then append and PUT back

---

<!-- _class: hero dark -->

# Enriching the prompt

---

<!-- _class: content dark -->

# The prompt endpoint

## AMS assembles context for you

`POST /v1/memory/prompt` returns:

1. **System message** — summaries + long-term memories
2. **Recent messages** — conversation history
3. **Current message** — the user's latest input

---

<!-- _class: content dark -->

# The prompt enricher node

## Fetch, convert, return

```typescript
const enrichedPrompt = await fetchMemoryPrompt(sessionId, userMessage)

const promptMessages = enrichedPrompt.messages.map(msg => {
  if (msg.role === 'user') return new HumanMessage(text)
  if (msg.role === 'assistant') return new AIMessage(text)
  return new SystemMessage(text)
})

return { promptMessages }
```

---

<!-- _class: hero dark -->

# Go do it!

---

<!-- SECTION: Stage 4 — Brief Generator -->
<!-- ==================================== -->

<!-- _class: hero hyper -->

# Stage 4: Brief generator

---

<!-- _class: content dark -->

# Bringing it all together

## Parallel fetch, then generate

- **article-fetcher** — Recent articles by date range
- **memory-fetcher** — Long-term preferences from AMS
- **brief-generator** — Personalized summary with an LLM

---

<!-- _class: centered-content dark -->

# The brief graph

## Fan-out from START, fan-in at the generator

<!-- TODO: Replace with brief graph diagram -->

![w:700](https://picsum.photos/700/250)

---

<!-- _class: content dark -->

# Equal-length paths

## No defer needed

```typescript
graph.addEdge(START, 'article-fetcher')
graph.addEdge(START, 'memory-fetcher')
graph.addEdge('article-fetcher', 'brief-generator')
graph.addEdge('memory-fetcher', 'brief-generator')
graph.addEdge('brief-generator', END)
```

- Both paths are one node long
- LangGraph.js waits for both automatically
- `defer` is only needed when paths have different lengths

---

<!-- _class: content dark -->

# Memory comes full circle

## The chatbot learns, the brief remembers

- Chat: "I'm interested in climate policy"
- AMS stores it as a long-term memory
- Brief fetches it and prioritizes climate articles
- Two workflows, shared memory, one Redis

---

<!-- _class: hero dark -->

# Go do it!

---

<!-- SECTION: Wrap-Up -->
<!-- ================= -->

<!-- _class: hero hyper -->

# What you built

---

<!-- _class: content dark -->

# Four stages, one system

## From raw feeds to personalized briefs

1. **Ingestion** — RSS → enriched articles in Redis
2. **Search** — TAG + NUMERIC + VECTOR queries
3. **Chatbot** — ReAct agent with tools and memory
4. **Brief** — Personalized summaries via shared memory

All powered by **Redis**, **LangGraph.js**, and **Agent Memory Server**

---

<!-- _class: centered-content dark -->

# The complete architecture

<!-- TODO: Replace with full architecture diagram -->

![w:900](https://picsum.photos/900/400)

---

<!-- _class: thanks hyper -->

Thank you.
