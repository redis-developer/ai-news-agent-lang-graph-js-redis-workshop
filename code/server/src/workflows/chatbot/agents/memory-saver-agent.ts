import { fetchWorkingMemory, updateWorkingMemory, addChatMessage } from '@services'

import type { ChatState } from '../state.js'

export async function memorySaver(state: ChatState): Promise<Partial<ChatState>> {
  // TODO: Save the conversation exchange to AMS and Redis
  return {}
}
