import { searchLongTermMemories } from '@services'

import type { BriefState } from '../state.js'

/*==========================================================================
 * Fetches long-term memories from AMS to personalize the brief
 +=========================================================================*/
export async function memoryFetcher(_state: BriefState): Promise<Partial<BriefState>> {
  // TODO: Fetch long-term memories from AMS
  return { memories: [] }
}
