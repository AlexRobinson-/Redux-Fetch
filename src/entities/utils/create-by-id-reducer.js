import reducer from './../reducers/by-id';
import isObject from './../../utils/is-object';

const createByIdReducer = reducers => {
  if (!isObject(reducers)) {
    throw new Error(`createEntityReducer expects first argument to be an object, received type ${typeof reducers}}`);
  }

  return (state, action) => Object.keys(reducers).reduce(
    (newState, key) => ({
      ...newState,
      [key]: reducers[key](newState[key], action)
    }),
    reducer(state, action)
  )
}

export default createByIdReducer;