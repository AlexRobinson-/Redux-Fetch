import { combineReducers } from 'redux';
import nestSelectors from 'alexs-redux-helpers/selectors/nest-selectors';

import fetch, { selectors as rawFetchSelectors } from './fetch';
import entities, {
  selectors as rawEntitySelectors,
  createEntitySelector as rawCreateEntitySelector,
  createEntityReducer as rawCreateEntityReducer
} from './entities';

const reducer = combineReducers({
  fetch,
  entities: (state, action) => entities(state, action)
})

const createEntityReducer = reducers => combineReducers({
  fetch,
  entities: rawCreateEntityReducer(reducers)
})


const fetchSelectors = nestSelectors(rawFetchSelectors, state => state.fetch);
const entitySelectors = nestSelectors(rawEntitySelectors, state => state.entities);

const selectors = {
  fetch: fetchSelectors,
  entities: entitySelectors
}

const createEntitySelector = function () {
  return nestSelectors(rawCreateEntitySelector.apply(null, arguments), state => state.entities);
}

export default reducer;

export {
  reducer,
  selectors,
  createEntityReducer,
  createEntitySelector
}