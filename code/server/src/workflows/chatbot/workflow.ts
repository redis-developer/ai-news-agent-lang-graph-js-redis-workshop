import { StateGraph, START, END } from '@langchain/langgraph'

import { promptEnricher, memorySaver, toolUsingResponder } from './agents/index.js'
import { ChatAnnotation } from './state.js'

/* Create the workflow graph for processing a chat message */
const graph = new StateGraph(ChatAnnotation) as any

/* Add nodes */
graph.addNode('prompt-enricher', promptEnricher)
graph.addNode('tool-using-responder', toolUsingResponder)
graph.addNode('memory-saver', memorySaver)

/* Add edges */
graph.addEdge(START, 'prompt-enricher')
graph.addEdge('prompt-enricher', 'tool-using-responder')
graph.addEdge('tool-using-responder', 'memory-saver')
graph.addEdge('memory-saver', END)

/* Compile the workflow */
const chatWorkflow = graph.compile()

/* Export a function to run the workflow */
export async function invokeChat(sessionId: string, userMessage: string): Promise<string> {
  const result = await chatWorkflow.invoke({ sessionId, userMessage })
  return result.responseMessage ?? ''
}
