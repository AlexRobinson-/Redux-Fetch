export const hasEntities = action => action.payload && action.payload && action.payload.entities;

export const getAllEntities = action => (
  (action.payload && action.payload.entities)
  || {}
);

export const getEntities = (action, entityName) => (
  (action.payload && action.payload.entities && action.payload.entities[entityName])
  || {}
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