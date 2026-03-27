import { searchArticles } from '@services'

import type { BriefState } from '../state.js'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * ONE_DAY_MS
const ONE_MONTH_MS = 30 * ONE_DAY_MS

/*==========================================================================
 * Calculates the date range and fetches articles from the database
 +=========================================================================*/
export async function articleFetcher(state: BriefState): Promise<Partial<BriefState>> {
  // TODO: Fetch articles for the requested time period
  return { articles: [] }
}
