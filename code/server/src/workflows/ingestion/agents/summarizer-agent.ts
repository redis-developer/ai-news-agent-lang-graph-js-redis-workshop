import dedent from 'dedent'

import type { ArticleState } from '../state.js'
import { fetchLLM, fetchTokenCounter } from '@adapters'
import { log } from '@services'

const llm = fetchLLM()
const tokenCounter = fetchTokenCounter()

export async function summarizer(state: ArticleState): Promise<Partial<ArticleState>> {
  // TODO: Extract content from state

  // log('Summarizer', 'Generating summary')

  // /* If we don't have content, return an empty summary */
  // if (!content) {
  //   log('Summarizer', 'No content available to summarize. Returning empty summary.')
  //   return { summary: '' }
  // }

  // TODO: Build the prompt, send it to the LLM, and return the summary

  // /* Log the token counts to show the reduction */
  // log('Summarizer', 'Tokens in content:', tokenCounter.encode(content).length)
  // log('Summarizer', 'Tokens in summary:', tokenCounter.encode(summary).length)

  // log('Summarizer', 'Summary generation complete')

  return {}
}

function buildPrompt(content: string): string {
  // TODO: Write the prompt
  return ''
}
