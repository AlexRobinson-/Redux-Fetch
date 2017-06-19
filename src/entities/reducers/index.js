import { combineReducers } from 'redux';
import nestSelectors from 'alexs-redux-helpers/selectors/nest-selectors';
import { selectors as byIdSelectors } from './by-id';
import createByIdReducer from '../utils/create-by-id-reducer';
import createConfigurableReducer from '../utils/create-configurable-reducer';
import timestamp, { selectors as timestampSelectors } from './timestamp';
import editable, { selectors as editableSelectors } from './editable';
import optimistic, { selectors as optimisticSelectors } from './optimistic'

export default (byIdReducers = {}, editableReducers = {}) => combineReducers({
  byId: createByIdReducer(byIdReducers),
  timestamp,
  editable: createConfigurableReducer(editable, editableReducers),
  optimistic
})

const nestedSelectors = Object.assign({},
  nestSelectors(byIdSelectors, state => state.byId),
  nestSelectors(optimisticSelectors, state => state.optimistic),
  nestSelectors(timestampSelectors, state => state.timestamp),
  nestSelectors(editableSelectors, state => state.editable)
)

const getById = (state, entityName, id, withOptimistic = true) => {
  const item = nestedSelectors.getById(state, entityName, id)

  if (!withOptimistic) return item;

  const updates = nestedSelectors.getItemUpdates(state, entityName, id)

  if (!item && !updates) return null;

  return {
    ...item,
    ...updates
  }
}
const getAll = (state, entityName, withOptimistic = true) => {
  const items = nestedSelectors.getAll(state, entityName);

  if (!withOptimistic) return items;

  return items.map(item => ({ ...item, ...nestedSelectors.getItemUpdates(state, entityName, item.id) }))
}

export const selectors = {
  ...nestedSelectors,
  getById,
  getAll
}
