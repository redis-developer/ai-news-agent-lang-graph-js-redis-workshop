import { log } from '@services'

import type { BriefRequest, BriefResult } from './types.js'
import { invokeBrief } from './workflow.js'

/*==========================================================================
 * Generate a personalized news brief
 +=========================================================================*/
export async function brief(request: BriefRequest): Promise<BriefResult> {
  const { period } = request

  log('Brief Workflow', `🗞️ Generating ${period} brief`)

  const result = await invokeBrief(period)

  log('Brief Workflow', `✅ Generated brief with ${result.articleCount} articles`)

  return result
}
