import { selectors } from './reducers/index';

export const hasEntities = action => action.payload && action.payload && action.payload.entities;

export const getAllEntities = action => (
  (action.payload && action.payload.entities)
  || {}
);

export const getEntities = (action, entityName) => (
  (action.payload && action.payload.entities && action.payload.entities[entityName])
  || {}
);


export const createEntitySelector = (type, baseSelectors = selectors) => Object.keys(baseSelectors).reduce(
  (entitySelectors, selector) => ({
    ...entitySelectors,
    [selector]: (state, ...params) => baseSelectors[selector](state, type, ...params)
  }), baseSelectors
);

export const updateEntity = (state, id, callback) => {
  if (state && state[id]) {
    return {
      ...state,
      [id]: callback(state[id])
    }
  }

  return state
}