import dedent from 'dedent'
import { z } from 'zod'

import type { ArticleState } from '../state.js'
import { fetchLLM } from '@adapters'
import { log } from '@services'

// TODO: Define the schema for topic classification output

/* Create the LLM instance */
const llm = fetchLLM()

export async function topicClassifier(state: ArticleState): Promise<Partial<ArticleState>> {
  // TODO: Extract the feed item and content from the state

  // log('Topic Classifier', 'Extracting topics')

  // /* Make sure we have the required data */
  // if (!feedItem) throw new Error('No feed item to process')
  // if (!content) throw new Error('No content to classify')

  // TODO: Build the prompt, call the LLM, and return the topics

  // /* Log the extracted topics */
  // log('Topic Classifier', 'Extracted topics:', result.topics.join(', '))

  return {}
}

function buildPrompt(title: string, content: string): string {
  // TODO: Write the prompt
  return ''
}
