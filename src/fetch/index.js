import reducer, { selectors } from './reducer'
import { connectionStats, fetchAction } from './actions'
import { SUCCESS, FETCH_ACTION_TYPES } from './constants';

export default reducer
export {
  selectors,
  connectionStats,
  fetchAction,
  FETCH_ACTION_TYPES
}

export const fetchSuccessType = ref => `${ref}_${SUCCESS}`