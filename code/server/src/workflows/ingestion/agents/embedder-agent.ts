import type { ArticleState } from '../state.js'
import { fetchEmbedder } from '@adapters'
import { log } from '@services'

// TODO: Create the embedding model instance

export async function embedder(state: ArticleState): Promise<Partial<ArticleState>> {
  // TODO: Extract the feed item and summary from the state

  // log('Embedder', 'Generating embedding')

  // /* Make sure we have the required data */
  // if (!feedItem) throw new Error('No feed item to process')
  // if (!summary) throw new Error('No summary to embed')

  // TODO: Combine title and summary, generate embedding, and return it

  // log('Embedder', 'Embedding text:', textToEmbed.length, 'characters')

  // log('Embedder', 'Generated embedding:', embedding.length, 'dimensions')

  return {}
}
