import {
  createMultiReducer,
  createDynamicReducer,
  createMetaReducer
} from 'alexs-redux-helpers/reducers'
import {
  NOT_LOADED,
  PENDING,
  LOADED,
  FAILED,
  REQUEST,
  SUCCESS,
  FAILURE,
  CANCEL,
  SLOW_CONNECTION,
} from './constants';

export default createMultiReducer({
  status: createMetaReducer('fetch', createDynamicReducer({
    initial: NOT_LOADED,
    [REQUEST]: [action => action.ref, PENDING],
    [SUCCESS]: [action => action.ref, LOADED],
    [FAILURE]: [action => action.ref, FAILED],
    [CANCEL]: [action => action.ref, null]
  })),
  failedCount: createMetaReducer('fetch', createDynamicReducer({
    initial: 0,
    [SUCCESS]: [action => action.ref, 0],
    [FAILURE]: [action => action.ref, state => state + 1],
    [CANCEL]: [action => action.ref, 0]
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
  }),
  error: (state = {}, action) => {
    if (!action || !action.meta || !action.meta.fetch) {
      return state;
    }

    if (action.meta.fetch.type === REQUEST || action.meta.fetch.type === SUCCESS || action.meta.fetch.type === CANCEL) {
      return {
        ...state,
        [action.meta.fetch.ref]: null
      };
    }

    if (action.meta.fetch.type === FAILURE) {
      return {
        ...state,
        [action.meta.fetch.ref]: action.payload.error
      };
    }

    return state;
  }
});

const getIsPending = ({ status }, ref) => {
  return !!status[ref] && status[ref] === PENDING
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
  if (!getIsPending(state, ref)) {
    return false;
  }

  return !!state.slow[ref];
}

const getFailedAttempts = (state, ref) => {
  return state.failedCount[ref] || 0
}

const getHasFailed = (state, ref) => state.status[ref] === FAILED

const getStatus = (state, ref) => state.status[ref] || NOT_LOADED;

const getErrorMessage = (state, ref) => state.error[ref];

const getTimestamp = (state, ref) => state.timestamp[ref];

export const selectors = {
  getIsPending,
  getIsFailing,
  getIsSlow,
  getFailedAttempts,
  getHasFailed,
  getStatus,
  getErrorMessage,
  getTimestamp
}
