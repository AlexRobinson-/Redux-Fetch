import { merge } from 'lodash/object'
import createDynamicReducer from 'alexs-redux-helpers/reducers/create-dynamic-reducer';
import {
  BEGIN_EDITING,
  BEGIN_NEW,
  UPDATE_EDITABLE,
  STOP_EDITING
} from './../action-types';
import { hasEntities, getEntities } from './../helpers'

const initialState = null;

const reducer = createDynamicReducer({
  initial: initialState,
  [BEGIN_EDITING]: [
    action => action.payload.entityName,
    (_, action) => action.payload.fields
  ],
  [BEGIN_NEW]: [
    action => action.payload.entityName,
    () => ({})
  ],
  [UPDATE_EDITABLE]: [
    action => action.payload.entityName,
    (state, action) => ({ ...state, ...action.payload.fields })
  ],
  [STOP_EDITING]: [
    action => action.payload.entityName,
    initialState
  ],
  default: (oldState, action) => {
    if (!hasEntities(action)) {
      return oldState
    }

    return Object.keys(oldState).reduce(
      (state, name) => ({
        ...state,
        [name]: (() => {
          if (!state[name] || !state[name].id) {
            return state;
          }

          const entities = getEntities(action, name)

          if (!entities[state[name].id]) {
            return state
          }

          return merge({}, state[name], entities[state[name].id])
        })()
      }), oldState
    )
  }
});
export default reducer;


const getEditable = (state, entityName) => state[entityName];

export const selectors = {
  getEditable
};
