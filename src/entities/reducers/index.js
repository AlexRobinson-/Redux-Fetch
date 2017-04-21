import { combineReducers } from 'redux';
import nestSelectors from 'alexs-redux-helpers/selectors/nest-selectors';
import byId, { selectors as byIdSelectors, createEntityReducer as createReducer } from './by-id';
import timestamp, { selectors as timestampSelectors } from './timestamp';
import editable, { selectors as editableSelectors } from './editable';
import optimistic, { selectors as optimisticSelectors } from './optimistic'

export default combineReducers({
  byId,
  timestamp,
  editable,
  optimistic
});

export const createEntityReducer = reducers => combineReducers({
  byId: createReducer(reducers),
  timestamp,
  editable,
  optimistic
})

const nestedByIdSelectors = nestSelectors(byIdSelectors, state => state.byId)
const nestedOptimisticSelectors = nestSelectors(optimisticSelectors, state => state.optimistic)

const getById = (state, entityName, id) => {
  const item = nestedByIdSelectors.getById(state, entityName, id)
  const updates = nestedOptimisticSelectors.getItemUpdates(state, entityName, id)

  if (!item && !updates) return null;

  return {
    ...item,
    ...updates
  }
}
const getAll = (state, entityName) => {
  const items = nestedByIdSelectors.getAll(state, entityName);
  return items.map(item => ({ ...item, ...nestedOptimisticSelectors.getItemUpdates(state, entityName, item.id) }))
}

const nestedSelectors = Object.assign({},
  nestedOptimisticSelectors,
  nestSelectors(timestampSelectors, state => state.timestamp),
  nestSelectors(editableSelectors, state => state.editable),
);

const getIsFresh = (state, type, id) => {
  const item = nestedSelectors.getById(state, type, id);

  if (item === undefined) {
    return false;
  }

  const timestamp = nestedSelectors.getTimestamp(state, type, id);

  if (timestamp === undefined) {
    return false;
  }

  return timestamp + (60000) > Date.now()
}

export const selectors = {
  ...nestedSelectors,
  getIsFresh,
  getById,
  getAll
}
