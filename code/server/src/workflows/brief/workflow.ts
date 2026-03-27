import { StateGraph, START, END } from '@langchain/langgraph'

import { articleFetcher, memoryFetcher, briefGenerator } from './agents/index.js'
import { BriefAnnotation } from './state.js'
import type { BriefPeriod } from './types.js'

/* Create the workflow graph for generating a news brief */
const graph = new StateGraph(BriefAnnotation) as any

// TODO: Add nodes

// TODO: Add edges (article and memory fetchers run in parallel)

/* Compile the workflow */
const briefWorkflow = graph.compile()

/* Export a function to run the workflow */
export async function invokeBrief(period: BriefPeriod): Promise<{ brief: string; articleCount: number }> {
  const result = await briefWorkflow.invoke({ period })
  return {
    brief: result.brief,
    articleCount: result.articles.length
  }
}
