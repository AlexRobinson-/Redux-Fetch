# Core Api

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [createReducer(byIdReducers = entitySelectors)](#createreducerbyidreducers--entityselectors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## createReducer(byIdReducers = entitySelectors)
This will create the reducer for you to add into your root reducer.

Sometimes you need to modify an entity, but not through passing the normalized entities attribute in an action's payload.
To get around this, the `createReducer` function allows you to pass sub-reducers to handle specific entity types.

Now when the entity reducer runs, it will first try and merge in any new entities and then it will call each if your sub-reducers with their part of the entity state.

This functionality is only available to modify the entity store (dictionary of entities), so other parts of the library will need to be modified through the provided actions.

To help with updating entities in your sub reducer, an `updateEntity` function is provided. This function takes three parameters
1. **state**
2. **id** of the entity you want to update
3. **callback** (entity) -> updatedEntity

```js
import { combineReducers } from 'redux';
import createReducer from 'alexs-redux-fetch';
import { updateEntity } from 'alexs-redux-fetch/entities/helpers';
import yourOtherReducer from './somewhere';

const todos = (state, action) => {
  switch(action.type) {
    case 'DUPLICATE_TODO':
      return {
        ...state,
        [action.payload.newId]: {
          ...state[action.payload.oldId],
          id: action.payload.newId
        }
      }
      case 'COMPLETE_TODO':
        return updateEntity(state, action.payload.id, entity => ({...entity, completed: true}))
    default:
      return state;
  }
}

export default combineReducers({
  yourOtherReducer,
  api: createReducer({
    todos
  })
})
```