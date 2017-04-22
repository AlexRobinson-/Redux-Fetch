import {
  createMetaReducer,
  createMultiReducer
} from 'alexs-redux-helpers/reducers';
import { FETCH_ACTION_TYPES } from './../../fetch';
import { OPTIMISTIC_UPDATE, CANCEL_OPTIMISTIC_UPDATE } from './../action-types';

const reducer = createMultiReducer({
  updates: {
    initial: {},
    [OPTIMISTIC_UPDATE]: (state, action) => {
      return {
        ...state,
        [action.payload.ref]: action.payload.optimisticEntities
      }
    },
    [CANCEL_OPTIMISTIC_UPDATE]: (state, action) => ({
      ...state,
      [action.payload.ref]: null
    }),
    default: createMetaReducer('fetch', (state, meta) => {
      switch (meta.type) {
        case FETCH_ACTION_TYPES.SUCCESS:
          return {
            ...state,
            [meta.ref]: null
          }
        default:
          return state;
      }
    })
  },
  order: {
    initial: [],
    [OPTIMISTIC_UPDATE]: (state, action) => {
      return [
        ...state,
        action.payload.ref
      ]
    },
    [CANCEL_OPTIMISTIC_UPDATE]: (state, action) => {
      return state.filter(ref => ref !== action.payload.ref)
    },
    default: createMetaReducer('fetch', (state, meta) => {
      switch (meta.type) {
        case FETCH_ACTION_TYPES.SUCCESS:
          return state.filter(ref => ref !== meta.ref)
        default:
          return state;
      }
    })
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


