# Entities Api

## Actions

### Editable
This section of the entities api allows you to handle local edits to your data.
However, any changes here are not persisted to the entity store, to do that you should dispatch an action with the `entities` payload, preferably after performing an api call to save it to your database.

#### beginEditing(entityName, fields)
Assigns the fields to the editable entity

```js
import { beginEditing } from 'alexs-redux-fetch/entities/actions';

beginEditing('todo', {id: '123', title: 'Do stuff'})
```

#### update
Merges the fields into the editable entity

```js
import { update } from 'alexs-redux-fetch/entities/actions';

update('todo', {title: 'Do other stuff'})
```

#### stopEditing
Sets the editable entity to null

```js
import { stopEditing } from 'alexs-redux-fetch/entities/actions';

stopEditing('todo')
```

#### createEditActions(entityName)
Generates functions for all of the above editable functions so that passing in the entityName is not required for each call.

```js
import { createEditActions } from 'alexs-redux-fetch/entities/actions';

const editTodoActions = createEditActions('todo')

editTodoActions.beginEditing({id: 1, title: 'Do stuff', completed: true});
editTodoActions.update({completed: false});
editTodoActions.stopEditing();
```

### Optimistic Updates

#### optimisticUpdate(ref, entities)
Creates an optimistic update that can be referenced by the provided ref.

```js
import { schema, normalize } from 'normalizr';
import { optimisticUpdate } from 'alexs-redux-fetch/entities/actions';

const todo = new schema.Entity('todo');

optimisticUpdate('TODO/1/SAVE', normalize({id: 1, completed: false}, todo).entities)
```

## Selectors

### getById(state, entityName, id, withOptimistic = true) -> (Entity | undefined)
Returns the entity for the given type and id.

If withOptimistic is true, if the entity has been optimistically updated, the entity will be merged with the updates and have the added information:

```js
{
  __optimistic: true
  __refs: [] // list of refs that have current optimistic updates for the entity
}
```

### getAll(state, entityName, withOptimistic = true) -> []
Returns all entities currently stored for the given entityName.

Using this function isn't recommended, as it just does an Object.values(), it is probably better to keep a list of ids stored to loop through rather than getting all items*

For now you will need to create these lists of ids.

If withOptimistic is true, if the entity has been optimistically updated, the entity will be merged with the updates and have the added information:
```js
{
  __optimistic: true
  __refs: [] // list of refs that have current optimistic updates for the entity
}
```

### getItemUpdateForRef(state, entityName, id, ref) -> {}
Returns the fields of the entity that have been optimistically updated.

```js
// Add the entity
dispatch({
  type: 'SOME_ACTION',
  payload: {
    entities: {
      todo: {
        1: {
          id: 1,
          title: 'Do stuff',
          completed: false
        }
      }
    }
  }
})

// Create the optimistic update
dispatch(optimisticUpdate('TODO/1/COMPLETE', {
  todo: {
    1: {
      completed: true
    }
  }
}))

// Use the selector to get the changes
getItemUpdateForRef(state, 'todo', 1, 'TODO/1/COMPLETE'); // { completed: true }
```

### getItemUpdates(state, entityName, id) -> {}
Returns all of the optimistic updates for an entity.

If the entity has been optimistically updated, the returned entity have the added information:
```js
{
  __optimistic: true
  __refs: [] // list of refs that have current optimistic updates for the entity
}
```

```js
// Add the entity
dispatch({
  type: 'SOME_ACTION',
  payload: {
    entities: {
      todo: {
        1: {
          id: 1,
          title: 'Do stuff',
          completed: false
        }
      }
    }
  }
})

// Create the optimistic update
dispatch(optimisticUpdate('TODO/1/COMPLETE', {
  todo: {
    1: {
      completed: true
    }
  }
}))

// Create the optimistic update
dispatch(optimisticUpdate('TODO/1/UPDATE', {
  todo: {
    1: {
      title: 'Do other stuff'
    }
  }
}))

// Use the selector to get the changes
getItemUpdates(state, 'todo', 1);

/* 
 {
   id: 1,
   title: 'Do other stuff',
   completed: true,
   refs: [
     'TODO/1/COMPLETE',
     'TODO/1/UPDATE'
   ],
   __optimistic: true
 }
 */
```

### getTimestamp(state, entityName, id) -> (timestamp | undefined)
Returns the timestamp of when the entity was last written into.

*Note: This doesn't take into account your reducers passed into createReducer*

### getEditable(state, entityName) -> (Entity | undefined)
Returns the current editable entity for the given entityType.

### createEntitySelectors(entityName, selectors = entitySelectors) -> {}
All of the above selectors are in the format (state, entityName, ...params). So to avoid passing in entityName each time, you can use createEntitySelectors to generate entity specific selectors.

You can also pass in your own selectors as the third parameter if you have added onto the provided entity selectors, your custom selectors must be in the same format as (state, entityName, ...params).
 
```js
import { createEntitySelectors, entitySelectors } from 'alexs-redux-fetch';

// Todo selectors
const todoSelectors = createEntitySelectors('todo')
todoSelectors.getById(state, 123) // getById(state, 'todo', 123)

// User selectors
const getUsername = (state, entityName, id) => {
  const user = entitySelectors.getById(state, entityName, id);
  
  if (!user) {
    return undefined;
  }
  
  return user.username;
}

const userSelectors = createEntitySelectors('user', undefined, {
  ...entitySelectors,
  getUsername
});
userSelectors.getUsername(state, 1)
```

## Helpers

### hasEntities (action) -> Bool
Returns true if the given action contains entities.

```js
import { hasEntities } from 'alexs-redux-fetch/entities/helpers';

const action = {
  type: 'SOME_ACTION',
  payload: {
    entities: {
      todo: {
        1: {
          id: 1,
          title: 'Do something'
        }
      }
    }
  }
}

hasEntities(action); // true
hasEntities({type: 'cat'}); // false
```

### getAllEntities (action) -> {}
Returns all of the entities in the given action. If no entities in action it will return an empty object.

```js
import { getAllEntities } from 'alexs-redux-fetch/entities/helpers';

const action = {
  type: 'SOME_ACTION',
  payload: {
    entities: {
      todo: {
        1: {
          id: 1,
          title: 'Do something'
        }
      },
      user: {
        1: {
          id: 1,
          name: 'Someone'
        }
      }
    }
  }
}

getAllEntities(action); // { todo: { ... }, user: { ... } }
getAllEntities({type: 'cat'}); // {}
```

### getEntities (action, entityName) -> {}
Returns the entities for the entityName from the given action. If no entities of that type exist in the action it will return an empty object.

```js
import { getEntities } from 'alexs-redux-fetch/entities/helpers';

const action = {
  type: 'SOME_ACTION',
  payload: {
    entities: {
      todo: {
        1: {
          id: 1,
          title: 'Do something'
        }
      },
      user: {
        1: {
          id: 1,
          name: 'Someone'
        }
      }
    }
  }
}

getEntities(action, 'todo'); // { 1: { ... } }
getEntities(action, 'cat'); // {}
```

### updateEntity (state, id, (entity) -> updatedEntity) -> {}
A simple utility function to assist in the sub-reducers you create to handle custom actions for the entity store (see `createReducer` docs).

```js
import { updateEntity } from 'alexs-redux-fetch/entities/helpers';

const todoState = {
  1: {
    id: 1,
    title: 'Do something',
    completed: false
  }
}

const newState = updateEntity(todoState, 1, entity => ({ ...entity, completed: true}))

/*
newState = {
  1: {
    id: 1,
    title: 'Do something',
    completed: true
  }
}
*/
```