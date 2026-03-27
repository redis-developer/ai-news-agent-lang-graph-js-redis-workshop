import { invokeChat } from './workflow.js'
import type { ChatRequest, ChatResponse } from './types.js'

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const { sessionId, message } = request

  /* Invoke the workflow */
  const response = await invokeChat(sessionId, message)

  return { response }
}
