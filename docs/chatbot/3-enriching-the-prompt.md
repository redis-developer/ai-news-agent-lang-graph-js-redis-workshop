# Enriching the Prompt

You've built the responder and the memory saver. The chatbot can search articles and conversations get saved to AMS—but the prompt enricher is still a passthrough, so the chatbot never sees its own history. In this final step, you'll replace the passthrough with a call to AMS that hydrates the prompt with conversation history and long-term memories.

```mermaid
graph LR
    START([START]) --> prompt-enricher --> tool-using-responder --> memory-saver --> END([END])
```

## The Prompt Endpoint

In the previous step, you used AMS's `working-memory` endpoints to save and fetch raw conversation messages. AMS also has a **prompt** endpoint that does something more powerful: it takes the current user message, retrieves the conversation history, searches for relevant long-term memories, and assembles everything into a ready-to-use list of messages.

### What the Prompt Endpoint Returns

When you call `POST /v1/memory/prompt`, AMS returns an array of messages that includes:

1. A **system message** containing a summary of older conversation turns (if the conversation is long enough to have been summarized) and any relevant long-term memories
2. Recent **conversation messages** (user and assistant turns) that haven't been summarized yet
3. The **current user message** as the final entry

This is exactly what the ReAct agent needs as input—a complete, context-rich message history with the system instructions, relevant memories, and the current question all assembled in the right order.

### The Memory Prompt Client

Open `services/memory-service/memory-prompt.ts`. The `fetchMemoryPrompt` function sends a request to AMS with the session ID and the current user message as a search query for long-term memories:

```typescript
const request: MemoryPromptRequest = {
  query,
  session: { session_id: sessionId },
  long_term_search: { text: query, limit: LONG_TERM_MEMORY_LIMIT }
}
```

The `long_term_search` field tells AMS to search for long-term memories that are semantically relevant to the user's current message. AMS performs a vector similarity search against its stored memories and includes the top matches in the system message. This means if the user previously expressed interest in AI policy, and now asks about technology regulation, AMS will surface those earlier memories as context.

No need to make any changes here. The client is already written for you.

## Building the Prompt Enricher

Open `agents/prompt-enricher-agent.ts`. Right now the function just wraps the user's message as a `HumanMessage` and returns it—that's the passthrough stub that let the chatbot work (without memory) after Step 1. You'll replace the entire body of this function with code that fetches the enriched prompt from AMS and converts it into LangChain.js message objects. The imports you'll need (`fetchMemoryPrompt`, `AIMessage`, `HumanMessage`, `SystemMessage`) are already at the top of the file.

### Fetching the Enriched Prompt

Destructure `sessionId` and `userMessage` from state, then call the memory prompt service:

```typescript
const { sessionId, userMessage } = state

/* Fetch hydrated prompt from AMS with context and relevant memories */
const enrichedPrompt = await fetchMemoryPrompt(sessionId, userMessage)
```

### Converting to LangChain.js Messages

The ReAct agent expects LangChain.js message objects (`HumanMessage`, `AIMessage`, `SystemMessage`), but AMS returns plain objects with `role` and `content` fields. Map the AMS messages to the right LangChain.js types:

```typescript
/* Build LangChain messages from AMS response */
const promptMessages = enrichedPrompt.messages.map(msg => {
  const text = typeof msg.content === 'string' ? msg.content : msg.content.text
  if (msg.role === 'user') return new HumanMessage(text)
  if (msg.role === 'assistant') return new AIMessage(text)
  return new SystemMessage(text)
})
```

The `content` field in AMS messages can be either a plain string or an object with a `text` property—the ternary handles both cases. Then a simple role check maps each message to its LangChain.js equivalent.

### Returning the Messages

Return the converted messages so the tool-using responder can use them:

```typescript
return { promptMessages }
```

That's it. The prompt enricher fetches the full context—conversation history, summarized older turns, and relevant long-term memories—and converts it into the format the ReAct agent expects.

## Try It Out

Restart the server and open the **Chat** panel. If you have messages from before, click the **clear** button to start fresh—this clears both the chat history and the AMS working memory, giving you a clean slate.

Now have a real conversation:

1. Ask about a topic: "What's the latest news about AI?"
2. Ask a follow-up: "Tell me more about the first article"
3. Reference something from earlier: "How does that compare to what you mentioned before?"

The chatbot should follow the thread, referencing earlier messages and maintaining context across turns.

### Long-Term Memory in Action

Long-term memories build up over time as AMS extracts facts and preferences from your conversations. To see this in action:

1. Tell the chatbot something about yourself: "I'm particularly interested in climate policy and renewable energy"
2. Chat about other topics for a while
3. Start a **new conversation** (click clear, which resets the session)
4. Ask a general question like "What should I read today?"

The chatbot should factor in your stated interests, even though this is a brand-new session. AMS stored "the user is interested in climate policy and renewable energy" as a long-term memory and retrieved it because it was relevant to the query.

## What You Built

Take a step back and look at the complete flow:

```mermaid
graph LR
    START([START]) --> prompt-enricher --> tool-using-responder --> memory-saver --> END([END])
```

1. **Prompt enricher** reads from AMS—conversation history, summaries, long-term memories—and builds the prompt
2. **Tool-using responder** processes the prompt, searches for articles as needed, and generates a response
3. **Memory saver** writes the new exchange back to AMS, where it becomes part of the history for next time

Memory flows in a circle: read → think → act → write → read again. The chatbot gets smarter with every conversation.

You've completed Stage 3. The chatbot can search, converse, and remember.

Next: [Stage 4: Brief Generator](../brief/0-overview.md)
