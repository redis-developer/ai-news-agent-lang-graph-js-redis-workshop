import dedent from 'dedent'

import { fetchLargeLLM } from '@adapters'
import type { SearchedArticle, LongTermMemory } from '@services'

import type { BriefPeriod } from '../types.js'
import type { BriefState } from '../state.js'

export async function briefGenerator(state: BriefState): Promise<Partial<BriefState>> {
  // TODO: Generate a personalized brief from articles and memories
  return { brief: '' }
}

function buildPrompt(period: BriefPeriod, articles: SearchedArticle[], memories: LongTermMemory[]): string {
  return dedent`
    You are a personalized news briefing assistant. Generate a concise,
    engaging news brief based on the following articles from the
    ${buildPeriodLabel(period)}.

    ${buildMemoryContext(memories)}

    ## Available Articles (${articles.length} total)
    ${buildArticlesContext(articles)}

    ## Instructions
    - Create a brief summary highlighting the most important and relevant news
    - If user interests are provided, prioritize stories that match those interests
    - Be concise but informative
    - Don't list articles, summarize what has happened
    - Use markdown formatting with headers and bullet points
    - Maximum 500 words
  `
}

function buildMemoryContext(memories: LongTermMemory[]): string {
  if (memories.length === 0) return ''

  return dedent`
    ## User Interests and Preferences
    Based on previous conversations, the user is interested in:
    ${memories.map(m => `- ${m.text}`).join('\n')}

    Prioritize news that relates to these interests.
  `
}

function buildArticlesContext(articles: SearchedArticle[]): string {
  return articles.map(a => buildArticle(a)).join('\n\n')
}

function buildArticle(article: SearchedArticle): string {
  return dedent`
    ### ${article.title}
    - Source: ${article.source}
    - Topics: ${article.topics.join(', ')}
    - People: ${article.namedEntities.people.join(', ') || 'None'}
    - Organizations: ${article.namedEntities.organizations.join(', ') || 'None'}
    - Summary: ${article.summary}
  `
}

function buildPeriodLabel(period: BriefPeriod): string {
  switch (period) {
    case 'daily':
      return 'last 24 hours'
    case 'weekly':
      return 'last week'
    case 'monthly':
      return 'last month'
    default:
      return 'last 24 hours'
  }
}
