import reducer, { selectors } from './reducer';
import { connectionStats, fetchAction } from './actions';
import { SUCCESS, FAILED, PENDING, CANCEL, FETCH_ACTION_TYPES } from './constants';

export default reducer
export {
  selectors,
  connectionStats,
  fetchAction,
  FETCH_ACTION_TYPES
};

export const successType = ref => `${ref}_${SUCCESS}`;
export const pendingType = ref => `${ref}_${PENDING}`;
export const failedType = ref => `${ref}_${FAILED}`;
export const cancelType = ref => `${ref}_${CANCEL}`;
