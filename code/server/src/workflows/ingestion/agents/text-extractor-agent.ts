import { convert } from 'html-to-text'
import dedent from 'dedent'

import type { ArticleState } from '../state.js'
import { fetchLLM, fetchTokenCounter } from '@adapters'
import { log } from '@services'

// TODO: Create the LLM instance
const tokenCounter = fetchTokenCounter()

export async function textExtractor(state: ArticleState): Promise<Partial<ArticleState>> {
  // TODO: Extract the feed item from the state

  // /* Make sure we have a feed item */
  // if (!feedItem) throw new Error('No feed item to process')

  // log('Text Extractor', 'Extracting article text')

  // /* If we don't have HTML, use the RSS content. Nothing to do here. */
  // if (!feedItem.html) {
  //   log('Text Extractor', 'No HTML available, using RSS content')
  //   return { content: feedItem.content }
  // }

  // TODO: Extract text from HTML, send to LLM, return content

  // /* Log the token counts to show the massive savings */
  // log('Text Extractor', 'Tokens in HTML:', tokenCounter.encode(feedItem.html).length)
  // log('Text Extractor', 'Tokens in text:', tokenCounter.encode(text).length)
  // log('Text Extractor', 'Tokens in content:', tokenCounter.encode(content).length)

  // log('Text Extractor', 'Text extraction complete')

  return {}
}

function extractTextFromHtml(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: false } },
      { selector: 'img', format: 'skip' },
      { selector: 'script', format: 'skip' },
      { selector: 'style', format: 'skip' }
    ]
  })
}

function buildPrompt(text: string): string {
  // TODO: Write the prompt
  return ''
}
