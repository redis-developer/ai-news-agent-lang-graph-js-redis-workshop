# Saving Memory

Your chatbot can search articles and respond to questions—but it forgets everything the moment a turn ends. Ask it about AI, get a great answer, then say "tell me more about that" and it has no idea what "that" is. To fix this, you need to give the chatbot **memory**.

```mermaid
graph LR
    START([START]) -.-> prompt-enricher:::missing -.-> tool-using-responder --> memory-saver --> END([END])
```

## What Is Agent Memory Server?

**Agent Memory Server (AMS)** is a standalone service that manages memory for AI agents. It runs alongside your application and provides a REST API for storing and retrieving two types of memory:

- **Working memory** — The conversation so far. AMS stores the messages exchanged between the user and the assistant, keyed by session ID. This is what lets the chatbot know what was said earlier in the current conversation. Working memory also handles **automatic summarization**—when the conversation gets long, AMS compresses older messages into a summary so the context window doesn't overflow.

- **Long-term memory** — Facts and preferences extracted from conversations. AMS automatically analyzes the conversation and stores relevant information—like "the user is interested in climate policy" or "the user prefers concise answers"—as searchable memories. These persist across sessions and are retrieved semantically based on relevance to the current query.

AMS stores all of its data in Redis—working memory, long-term memories, and the indexes it uses for semantic search. In this workshop, it's using the same Redis instance as your article data, so everything lives in one place. After it runs, you can even look at what it has stored using Redis Insight.

You don't need to build AMS or understand its internals for this workshop. It's already running as part of the workshop infrastructure. You just need to know how to talk to it.

## The Memory Service

The code that communicates with AMS is already written for you in `services/memory-service/`. Take a moment to look at these files—you'll use them in this step and the next.

### Types (`types.ts`)

Open `services/memory-service/types.ts`. The key types are:

- **`MemoryMessage`** — A single message with a `role` (`'user'`, `'assistant'`, or `'system'`) and `content` (either a string or an object with a `text` field)
- **`UpdateWorkingMemoryRequest`** — The payload for updating working memory. The main field is `messages`—the full conversation history to store
- **`WorkingMemoryResponse`** — What AMS returns when you fetch or update working memory. Includes the `messages` array plus metadata like token counts

### Working Memory Client (`working-memory.ts`)

Open `services/memory-service/working-memory.ts`. Two functions matter for this step:

- **`fetchWorkingMemory(sessionId)`** — `GET /v1/working-memory/{sessionId}`. Fetches the current conversation history for a session. Returns `null` if no memory exists yet (first message in a new conversation).
- **`updateWorkingMemory(sessionId, payload)`** — `PUT /v1/working-memory/{sessionId}`. **Replaces** the entire working memory for a session with the provided messages—this is a full replacement, not an append. That's why you'll need to fetch the existing messages first and add the new ones before sending the update. AMS processes these messages—it may summarize older ones if the conversation is getting long and will extract long-term memories automatically.

These are standard `fetch` calls to the AMS REST API. Nothing surprising in the implementation, but it's worth seeing the endpoints and the request/response shapes.

## Building the Memory Saver

Open `agents/memory-saver-agent.ts`. Right now it's a stub that returns an empty object—the node runs but doesn't do anything. This node runs after the tool-using responder, so both `userMessage` and `responseMessage` are available in state. You'll fill in the body to save the new exchange to AMS.

### Pulling Data from State

Start by destructuring the three fields you need:

```typescript
const { sessionId, userMessage, responseMessage } = state
```

### Fetching Existing Memory

Before you can append the new messages, you need to know what's already been said. Fetch the current working memory:

```typescript
/* Fetch current working memory */
const workingMemory = await fetchWorkingMemory(sessionId)
const existingMessages = workingMemory?.messages ?? []
```

If this is the first message in a new conversation, `fetchWorkingMemory` returns `null` and `existingMessages` will be an empty array.

### Appending the New Exchange

Build the updated message list by spreading the existing messages and adding the new user and assistant messages:

```typescript
/* Append new messages */
const updatedMessages = [
  ...existingMessages,
  { role: 'user' as const, content: userMessage },
  { role: 'assistant' as const, content: responseMessage }
]
```

The `as const` assertions narrow the `role` type from `string` to the literal union `'user' | 'assistant'` that the `MemoryMessage` type expects.

### Updating Working Memory

Send the full message history back to AMS:

```typescript
/* Update working memory */
await updateWorkingMemory(sessionId, { messages: updatedMessages })
```

AMS replaces the stored messages for this session with the updated list. Behind the scenes, AMS may summarize older messages if the conversation is getting long and will asynchronously extract long-term memories from the conversation.

### Saving Chat History

The memory saver also persists messages to a Redis Stream so the UI can reload the entire conversation history when you refresh the page. This is separate from AMS—it's just for the frontend:

```typescript
/* Also save to Redis Stream for full conversation history preservation */
await addChatMessage(sessionId, 'user', userMessage)
await addChatMessage(sessionId, 'assistant', responseMessage)
```

### Returning from the Node

The memory saver doesn't add anything to the graph state—it just persists data. Return an empty object:

```typescript
return {}
```

## Try It Out

Restart the server and open the **Chat** panel. Have a short conversation—ask about a topic, then ask a follow-up. The chatbot still won't remember your previous messages. That might seem odd since you just built the memory saver, but think about the graph flow:

```
prompt-enricher → tool-using-responder → memory-saver
```

Memory gets **saved** after the responder runs, but the **prompt-enricher** at the start of the next turn doesn't read it yet—it's still just passing the raw user message through. You're writing to memory but not reading from it.

But the data _is_ there. Open **Redis Insight** and browse the keys—alongside the `news:aggregator:` keys from earlier stages, you'll see new keys that AMS created for working memory and long-term memories. Poke around and see what AMS stored for your conversation.

Reading that memory back into the prompt is the last piece of the puzzle.

Next: [Enriching the Prompt](3-enriching-the-prompt.md)
