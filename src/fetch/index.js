import reducer, { selectors } from './reducer';
import { connectionStats, fetchAction } from './actions';
import { SUCCESS, FAILED, FETCHING, FETCH_ACTION_TYPES } from './constants';

export default reducer
export {
  selectors,
  connectionStats,
  fetchAction,
  FETCH_ACTION_TYPES
};

export const successType = ref => `${ref}_${SUCCESS}`;
export const fetchingType = ref => `${ref}_${FETCHING}`;
export const failedType = ref => `${ref}_${FAILED}`;
