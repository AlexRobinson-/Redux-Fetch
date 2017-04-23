import { mergeWith } from 'lodash/object';
import { hasEntities, getAllEntities } from '../helpers';

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return srcValue;
  }
}


const reducer = (state = {}, action) => {
  if (!hasEntities(action)) {
    return state
  }

  return mergeWith({}, state, getAllEntities(action), customizer)
}

export const createEntityReducer = reducers => (state, action) => Object.keys(reducers).reduce(
  (newState, key) => ({
    ...newState,
    [key]: reducers[key](newState[key], action)
  }),
  reducer(state, action)
);

export default reducer;

export const getById = (state, type, id) => state[type] && state[type][id];
export const getAll = (state, type, id) => Object.values(state[type] || {});

export const selectors = {
  getById,
  getAll
};
