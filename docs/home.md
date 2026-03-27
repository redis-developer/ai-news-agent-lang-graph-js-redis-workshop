# Welcome to the Workshop!

In this workshop, you'll build an AI-powered news agent using **Redis** and **LangGraph.js**. You'll work through four stages, each introducing new concepts and building on what came before. You'll work through the stages in order, adding code as you go.

If you're reading this, your workshop environment is ready to go. You can start with [Stage 1](ingestion/0-overview.md) or keep reading for an overview of what you'll build.

If you need it, a brief introduction to this environment and a selected links to documentation for technologies used in this workshop can be found in the sidebar. Just click the hamburger menu in the bottom left corner to access it.

---

## Stage 1: Feed Ingestion with LangGraph.js + Redis

In [Stage 1](ingestion/0-overview.md) you'll learn how to build a LangGraph.js workflow that takes raw RSS feed items and transforms them into enriched, searchable articles. We'll cover how to define graph state, create nodes, connect them with edges, and use fan-out and fan-in patterns for parallel processing. You'll implement all the important bits in the workflow and write the results of that workflow to Redis.

## Stage 2: Article Search with Redis Search

Now that you have an article database in Redis, you can search it. In [Stage 2](search/0-overview.md) you'll create a Redis Search index—defining a schema with TAG, NUMERIC, and VECTOR fields. Then, you'll search it using structured filters, vector similarity search, and filtered vector queries that combine both.

## Stage 3: Chatbot with LangGraph.js + Redis Search + Redis Agent Memory Server

In [Stage 3](chatbot/0-overview.md) we'll talk about the news. You'll build a conversational agent (i.e. a chatbot) using LangGraph.js and **Agent Memory Server (AMS)**. You'll give the agent a tool that uses the search code you built in Stage 2 to find relevant articles from the database you built in Stage 1. And, you'll add and short- and long-term memory to the agent with AMS—enabling it to remember previous interactions and preferences.

## Stage 4: Brief Generator with LangGraph.js + Redis Agent Memory Server

Finally, in [Stage 4](brief/0-overview.md) we'll bring it all together. You'll write a workflow that generates personalized news briefs. It'll fetch recent articles using the search code from Stage 2, retrieve long-term memories from AMS, then use them to generate a brief tailored to your interests.

---

So, let's get started with [Stage 1: Feed Ingestion](ingestion/0-overview.md)!
