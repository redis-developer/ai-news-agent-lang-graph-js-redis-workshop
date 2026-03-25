import { createHash } from 'crypto'

import { SCHEMA_FIELD_TYPE, SCHEMA_VECTOR_FIELD_ALGORITHM } from 'redis'

import { fetchEmbeddingDims, fetchEmbedder, fetchRedisConnection } from '@adapters'
import type { Article, ArticleData, SearchCriteria, SearchResponse } from './types.js'

const KEY_PREFIX = 'news:aggregator:article:'
const INDEX_NAME = 'news:aggregator:article:index'

const redis = await fetchRedisConnection()

await createIndex()

/*==========================================================================
 * Article CRUD operations
 +=========================================================================*/
export async function articleExists(link: string): Promise<boolean> {
  const key = generateArticleKey(link)
  const exists = await redis.exists(key)
  return exists === 1
}

export async function saveArticle(article: ArticleData): Promise<Article> {
  const id = generateArticleId(article.link)
  const articleWithId: Article = { id, ...article }

  // TODO: Build the key and save the article to Redis

  return articleWithId
}

export async function fetchArticleById(id: string): Promise<import('./types.js').ArticleResponse> {
  try {
    const key = `${KEY_PREFIX}${id}`
    const doc = (await redis.json.get(key)) as any

    if (!doc) {
      return { success: false, error: 'not_found' }
    }

    const article = {
      id: doc.id ?? '',
      title: doc.title ?? '',
      link: doc.link ?? '',
      content: doc.content ?? '',
      summary: doc.summary ?? '',
      source: doc.source?.title ?? '',
      publicationDate: doc.publicationDate ?? 0,
      topics: doc.topics ?? [],
      namedEntities: {
        people: doc.namedEntities?.people ?? [],
        organizations: doc.namedEntities?.organizations ?? [],
        locations: doc.namedEntities?.locations ?? []
      }
    }

    return { success: true, article }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

function generateArticleId(link: string): string {
  return createHash('sha1').update(link).digest('hex').substring(0, 16)
}

function generateArticleKey(link: string): string {
  return `${KEY_PREFIX}${generateArticleId(link)}`
}

/*==========================================================================
 * Creates the search index if it doesn't already exist.
 +=========================================================================*/
async function createIndex(): Promise<void> {
  // TODO: Check if the index already exists and return early if it does

  const embeddingDimensions = fetchEmbeddingDims()

  console.log(`Creating index ${INDEX_NAME}`)

  // TODO: Create the search index using redis.ft.create

  console.log(`Index ${INDEX_NAME} created`)
  console.log(
    'NOTE: If you change the index in code, you must delete the index in Redis CLI with:',
    `FT.DROPINDEX ${INDEX_NAME}`
  )
}

/*==========================================================================
 * Fetches all unique source names, topics, people, organizations, and
 * locations from the index.
 +=========================================================================*/
export async function fetchAllSources(): Promise<string[]> {
  return redis.ft.tagVals(INDEX_NAME, 'source')
}

export async function fetchAllTopics(): Promise<string[]> {
  return redis.ft.tagVals(INDEX_NAME, 'topics')
}

export async function fetchAllPeople(): Promise<string[]> {
  return redis.ft.tagVals(INDEX_NAME, 'people')
}

export async function fetchAllOrganizations(): Promise<string[]> {
  return redis.ft.tagVals(INDEX_NAME, 'organizations')
}

export async function fetchAllLocations(): Promise<string[]> {
  return redis.ft.tagVals(INDEX_NAME, 'locations')
}

/*==========================================================================
 * Searches for articles matching the given criteria. Supports TAG filters
 * (source, topics, entities), date range, and semantic search.
 +=========================================================================*/
export async function searchArticles(criteria: SearchCriteria, limit: number = 5): Promise<SearchResponse> {
  try {
    // Build the text query from criteria
    const queryParts: string[] = []

    // Escape special characters in TAG values
    const escapeTag = (tag: string) => tag.replace(/[-\\,.<>{}[\]"':;!@#$%^&*()+=]/g, '\\$&')

    // TODO: Add TAG filters for topics, people, organizations, and locations (AND logic)

    // TODO: Add TAG filter for sources (OR logic)

    // TODO: Add NUMERIC filter for date range

    // TODO: Assemble the text query from queryParts

    // TODO: Embed the semantic query into a vector buffer

    // TODO: Build the query and options, call redis.ft.search

    // TODO: Map the results to SearchedArticle objects

    return { success: true, articles: [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
