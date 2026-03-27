import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import dedent from 'dedent'

import { searchArticles as searchArticlesService } from '@services'

/*==========================================================================
 * Tool for searching articles in the database
 *
 * The LLM decides what to search for and how to filter based on the
 * user's request. Returns full article objects.
 +=========================================================================*/

const searchArticlesSchema = z.object({
  // TODO: Define the schema
})

type SearchArticlesParams = z.infer<typeof searchArticlesSchema>

async function searchArticles(params: SearchArticlesParams): Promise<string> {
  // TODO: Implement the search function
  return JSON.stringify({ articles: [] })
}

export const searchArticlesTool = tool(searchArticles, {
  name: 'search_articles',
  description: dedent`
    Search the news article database. Use semantic search for natural
    language queries, or filter by topics, people, organizations, locations,
    sources, and date range. Returns articles with id, title, summary, source,
    publicationDate, topics, and namedEntities (people, organizations, locations).
    Construct relative URLs using the article id: [Article Title](/article/{id}).
    Do not use http:// or https:// URLs.`,
  schema: searchArticlesSchema
})
