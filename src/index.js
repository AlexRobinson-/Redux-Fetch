import { combineReducers } from 'redux';
import nestSelectors from 'alexs-redux-helpers/selectors/nest-selectors';

import fetch, { selectors as rawFetchSelectors } from './fetch';
import createEntityReducer, {
  selectors as rawEntitySelectors,
  createEntitySelectors as rawCreateEntitySelectors
} from './entities';

const createReducer = reducers => combineReducers({
  fetch,
  entities: createEntityReducer(reducers)
})


const fetchSelectors = nestSelectors(rawFetchSelectors, state => state.fetch);
const entitySelectors = nestSelectors(rawEntitySelectors, state => state.entities);

const selectors = {
  fetch: fetchSelectors,
  entities: entitySelectors
}

const createEntitySelectors = (type, getState, ...args) => rawCreateEntitySelectors(type, state => getState(state).entities, ...args);
const createFetchSelectors = (getState = state => state) => nestSelectors(fetchSelectors, getState);

export default createReducer;

export {
  selectors,
  createEntityReducer,
  createReducer,
  createEntitySelectors,
  createFetchSelectors,
  fetchSelectors,
  entitySelectors
}