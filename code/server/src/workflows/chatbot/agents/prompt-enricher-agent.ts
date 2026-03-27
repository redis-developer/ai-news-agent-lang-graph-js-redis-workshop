import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

import { fetchMemoryPrompt } from '@services'

import type { ChatState } from '../state.js'

export async function promptEnricher(state: ChatState): Promise<Partial<ChatState>> {
  const { userMessage } = state
  return { promptMessages: [new HumanMessage(userMessage)] }
}
