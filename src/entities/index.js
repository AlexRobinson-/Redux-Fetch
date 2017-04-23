import reducer, { selectors, createEntityReducer } from './reducers';
import { createEntitySelector } from './utils/create-entity-selectors';

export default reducer;

export {
  createEntityReducer,
  selectors,
  createEntitySelector
}