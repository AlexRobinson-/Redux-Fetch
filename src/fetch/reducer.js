import {
  createMultiReducer,
  createDynamicReducer,
  createMetaReducer
} from 'alexs-redux-helpers/reducers'
import {
  NOT_LOADED,
  FETCHING,
  LOADED,
  FAILED,
  REQUEST,
  SUCCESS,
  FAILURE,
  SLOW_CONNECTION,
} from './constants';

export default createMultiReducer({
  status: createMetaReducer('fetch', createDynamicReducer({
    initial: NOT_LOADED,
    [REQUEST]: [action => action.ref, FETCHING],
    [SUCCESS]: [action => action.ref, LOADED],
    [FAILURE]: [action => action.ref, FAILED]
  })),
  failedCount: createMetaReducer('fetch', createDynamicReducer({
    initial: 0,
    [SUCCESS]: [action => action.ref, 0],
    [FAILURE]: [action => action.ref, state => state + 1]
  })),
  timestamp: createMetaReducer('fetch', createDynamicReducer({
    initial: null,
    [REQUEST]: [action => action.ref, null],
    [SUCCESS]: [action => action.ref, () => Date.now()]
  })),
  slow: createDynamicReducer({
    initial: null,
    [SLOW_CONNECTION]: [action => action.payload.ref, true],
    default: createMetaReducer('fetch', (state, action) => {
      return {
        ...state,
        [action.ref]: null
      }
    })
  })
});

const getIsLoading = ({ status }, ref) => {
  return !!status[ref] && status[ref] === FETCHING
}

const getIsFailing = (state, ref) => {
  const { status, failedCount } = state

  if (!status[ref]) {
    return false;
  }

  if (state[ref] === NOT_LOADED || state[ref] === LOADED) {
    return false;
  }

  if (!failedCount[ref]) {
    return false;
  }

  return failedCount[ref] > 0;
}

const getIsSlow = (state, ref) => {
  if (!getIsLoading(state, ref)) {
    return false;
  }

  return !!state.slow[ref];
}

const getFailedAttempts = (state, ref) => {
  return state.failedCount[ref] || 0
}

const getHasFailed = (state, ref) => state.status[ref] === FAILED

const getStatus = (state, ref) => state.status[ref] || NOT_LOADED;

export const selectors = {
  getIsLoading,
  getIsFailing,
  getIsSlow,
  getFailedAttempts,
  getHasFailed,
  getStatus
}
