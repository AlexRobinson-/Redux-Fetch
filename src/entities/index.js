import reducer, { selectors, createEntityReducer } from './reducers';
import { createEntitySelectors } from './utils/create-entity-selectors';

export default reducer;

export {
  createEntityReducer,
  selectors,
  createEntitySelectors
}