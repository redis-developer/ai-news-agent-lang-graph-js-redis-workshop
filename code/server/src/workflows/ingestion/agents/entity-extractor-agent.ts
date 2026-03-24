import dedent from 'dedent'
import { z } from 'zod'

import type { ArticleState } from '../state.js'
import { fetchLLM } from '@adapters'
import { log } from '@services'

// TODO: Define the schema for named entity extraction output

/* Create the LLM instance */
const llm = fetchLLM()

export async function entityExtractor(state: ArticleState): Promise<Partial<ArticleState>> {
  // TODO: Extract the feed item and content from the state

  // log('Entity Extractor', 'Extracting named entities')

  // /* Make sure we have the required data */
  // if (!feedItem) throw new Error('No feed item to process')
  // if (!content) throw new Error('No content to extract entities from')

  // TODO: Build the prompt, call the LLM, and return the entities

  // /* Log the extracted entities */
  // log('Entity Extractor', 'Extracted named entities:')
  // log('Entity Extractor', '  People:', namedEntities.people.join(', ') || 'none')
  // log('Entity Extractor', '  Organizations:', namedEntities.organizations.join(', ') || 'none')
  // log('Entity Extractor', '  Locations:', namedEntities.locations.join(', ') || 'none')

  return {}
}

function buildPrompt(title: string, content: string): string {
  // TODO: Write the prompt
  return ''
}
