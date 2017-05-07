import {
  createMetaReducer,
  createMultiReducer,
  createReducer
} from 'alexs-redux-helpers/reducers';
import { FETCH_ACTION_TYPES } from './../../fetch';
import { OPTIMISTIC_UPDATE, CANCEL_OPTIMISTIC_UPDATE } from './../action-types';

const reducer = createMultiReducer({
  updates: {
    initial: {},
    [OPTIMISTIC_UPDATE]: (state, action) => ({
      ...state,
      [action.payload.ref]: action.payload.optimisticEntities
    }),
    [CANCEL_OPTIMISTIC_UPDATE]: (state, action) => ({
      ...state,
      [action.payload.ref]: undefined
    }),
    default: createMetaReducer('fetch', createReducer({
      initial: {},
      [FETCH_ACTION_TYPES.SUCCESS]: (state, action) => ({
        ...state,
        [action.ref]: undefined
      })
    }))
  },
  order: {
    initial: [],
    [OPTIMISTIC_UPDATE]: (state, action) => state.includes(action.payload.ref) ? state : [
      ...state,
      action.payload.ref
    ],
    [CANCEL_OPTIMISTIC_UPDATE]: (state, action) => state.filter(ref => ref !== action.payload.ref),
    default: createMetaReducer('fetch', createReducer({
      initial: [],
      [FETCH_ACTION_TYPES.SUCCESS]: (state, action) => state.filter(ref => ref !== action.ref)
    }))
  }
})

export default reducer;

const getItemUpdateForRef = (state, entityName, id, ref) => {
  const { updates } = state;

  if (!updates[ref] || !updates[ref][entityName]) {
    return null;
  }

  if (!updates[ref][entityName][id]) {
    return null
  }

  return updates[ref][entityName][id]
}

const getItemUpdates = (state, entityName, id) => {
  return state.order.reduce(
    (item, ref) => {
      const update = getItemUpdateForRef(state, entityName, id, ref)

      if (!update) return item

      return {
        ...item,
        ...update,
        __optimistic: true,
        __refs: [
          ...(item.__refs || []),
          ref
        ]
      }
    }, {}
  )
}

export const selectors = {
  getItemUpdates,
  getItemUpdateForRef
}
