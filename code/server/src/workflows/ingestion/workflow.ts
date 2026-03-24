import { StateGraph, START, END } from '@langchain/langgraph'

import { ArticleData, FeedItem } from '@services'

import {
  textExtractor,
  summarizer,
  topicClassifier,
  entityExtractor,
  embedder,
  articleAssembler
} from './agents/index.js'
import { ArticleAnnotation } from './state.js'

// TODO: Create the workflow graph for processing a single feed item into an article

// TODO: Add nodes

// TODO: Add edges

// TODO: Compile the workflow

/* Export a function to run the workflow */
export async function invokeArticleWorkflow(feedItem: FeedItem): Promise<ArticleData | null> {
  // TODO: Invoke the workflow and return the article
  return null
}
