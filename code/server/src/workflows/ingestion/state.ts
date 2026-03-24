import { Annotation } from '@langchain/langgraph'
import type { ArticleData, FeedItem } from '@services'

export const ArticleAnnotation = Annotation.Root({
  feedItem: Annotation<FeedItem>(),
  article: Annotation<ArticleData>()
})

export type ArticleState = typeof ArticleAnnotation.State
