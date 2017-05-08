# Redux Fetch
A set of redux actions/selectors/reducers to handle making api calls that fetch data and then storing that data.

## About
The library comes with two main features 'Entities' and 'Fetch'.

For inspiration on how to use this library, check out [my example project](https://github.com/AlexRobinson-/redux-fetch-example)

### Entities
A generic entity store based around the normalizr library that stores entities by their id.

To add/update entities into this store, simply dispatch an action with an 'entities' payload.

```js
dispatch({
  type: 'SOME_ACTION',
  payload: {
    entities: normalize(response, Todo).entities
  }
})
```

The entities reducer also comes with a few other sub-reducers/features. These include:
 - **Timestamp** For every entity added to the store, a timestamp is added to keep track of when the data was last put into the redux store.
 - **Optimistic** Allows you to optimistically update the entity store and roll back any failed/cancelled updates
 - **Editable** Allows you to have one editable entity at a time
 
### Fetch
This set of redux actions/reducers/selectors allow you to easily keep track of your api request states.

This module keeps track of the following information:
 - **Failed count** How many times the api has failed without a successful response
 - **Timestamp** When the last successful attempt for a given api was
 - **Slow Connections** If a single request takes too long

## Usage
All that is required to use this library is redux, although there are some things you can do to make the overall experience nicer 

### 1. Pre-requisites
**Required**
- redux

**Optional**
- normalizr This will make it easy to normalize your data to be accepted into the generic entity store
- redux-thunk Some of the fetch actions are provided as thunks, though I'm sure you could work around this if you really needed to

### 2. Install the library
```sh
npm install alexs-redux-fetch
```

### 3. Add the reducer to your root reducer
Import createReducer from the library and add it into your root reducer.

*Look at the createReducer docs for more you can do with this*

```js
// your root reducer
import createReducer from 'alexs-redux-fetch';

export default combineReducers({
  ..., // your other reducers,
  api: createReducer()
})
```

### 4. Set up your selectors (optional, but recommended)
In whichever file you keep your selectors:

**Entity Selectors**
The easiest way to use the entity selectors is with the createEntitySelectors, which generates selectors for a specific entity.

createEntitySelectors function takes three parameters
- Entity name - the name of the entity you want to create selectors for. This will also be the name you use with the normalizr library
- Get state (optional) - A function that returns the sub-state for where you keep this library (defaults to returning the passed in state)
- Selectors (optional - should be rarely used) - The selectors you want to generate for the entity (will default to the the packages selectors, look at documentation for more information).

**Fetch Selectors**
To use the fetch selectors use createFetchSelectors, which takes one argument to get the state.   

```js
// wherever-you-keep-selectors.js (I normally keep them in same file as their reducer)
import { createEntitySelector, createFetchSelectors } from 'alexs-redux-fetch';

// your selectors

export const todoSelectors = createEntitySelector('todo', state => state.api);
export const userSelectors = createEntitySelector('user', state => state.api);

export const fetchSelectors = createFetchSelectors(state => state.api);
```

### 5. Using the fetch actions
The way the fetch feature keeps track of your individual api calls is via a unique ref.
It is recommended that you create ref generator functions to easily produce these refs.

```js
import { fetchAction } from 'alexs-redux-fetch/fetch/actions';

const fetchTodoApi = id => api(`/todos/${id}`)
const fetchTodoRef = id => `/TODO/${id}/GET`;

const saveTodoApi = (id, fields) => api.post(`/todos/${id}`, fields)
const saveTodoRef = id => `/TODO/${id}/SAVE`;

export const fetchTodo = id => fetchAction(
  fetchTodoRef(id),
  fetchTodo(id)
);

export const saveTodo = (id, fields) => fetchAction(
  saveTodoRef(id),
  saveTodoApi(id, fields)
);
```

### 6. Set up your api code (optional)
As mentioned in the above section, the entity reducer will use any entities from the action payload.

The fetchAction thunk in this library will add whatever your api/promise resolves with to the action payload.
So to make your action files a little cleaner, add your normalization code to your api functions.

Note: the fetchAction thunk is expecting your api/promise to resolve with an object with either a response or error ref. This can be added to the api code as well.

Example:
```js
// /api/todo.js

import { schema, normalize } from 'normalizr';

const { Entity } = schema;

export const Todo = new Entity('todo');

export const fetchAll = () => api('/todos')
  .then(response => normalize(response, [Todo]))
  .then(response => ({ response }))
  .catch(error => ({ error }));
  
// /actions/todo.js

import { fetchAction } from 'alexs-redux-fetch/fetch/actions';
import * as todoApi from '/api/todo';

export const fetchTodos = () => fetchAction('ALL_TODOS', todoApi.fetchAll())
```

## Core

### createReducer(byIdReducers - optional)
This will create the reducer for you to add into your root reducer.

The function takes optional sub-reducers that you can provide to co-manage specific entity states for instances where you can't provide the necessary update in a entities action payload.

Your sub-reducer will be called after our one. So if your action also contained entities, the state your reducer will be given will include the updated state.

```js
import { combineReducers } from 'redux';
import createReducer from 'alexs-redux-fetch';
import yourOtherReducer from './somewhere';

const todos = (state, action) => {
  switch(action.type) {
    case 'NUKE_ALL_THE_THINGS':
      return {}
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

## Entities

### Actions

#### Editable

##### beginEditing(entityName, fields)
Assigns the fields to the editable entity

```js
import { beginEditing } from 'alexs-redux-fetch/entities/actions';

beginEditing('todo', {id: '123', title: 'Do stuff'})
```

##### beginNew(entityName)
Sets the editable entity to an empty object

```js
import { beginNew } from 'alexs-redux-fetch/entities/actions';

beginNew('todo')
```

##### update
Merges the fields into the editable entity

```js
import { update } from 'alexs-redux-fetch/entities/actions';

update('todo', {title: 'Do other stuff'})
```

##### stopEditing
Sets the editable entity to null

```js
import { stopEditing } from 'alexs-redux-fetch/entities/actions';

stopEditing('todo')
```

##### createEditActions(entityName)
Wraps all of the editable entity actions with the entityName

```js
import { createEditActions } from 'alexs-redux-fetch/entities/actions';

const editTodoActions = createEditActions('todo')

editTodoActions.update({completed: false})

```

#### Optimistic

##### optimisticUpdate(ref, entities)
Creates an optimistic update optimisticUpdate that can be referenced by the provided ref.

```js
import { schema, normalize } from 'normalizr';
import { optimisticUpdate } from 'alexs-redux-fetch/entities/actions';

const todo = new schema.Entity('todo');

optimisticUpdate('TODO/1/SAVE', normalize({id: 1, completed: false}, todo))
```

##### cancelOptimisticUpdate(ref)
Cancels the optimistic update for the given ref

```js
import { cancelOptimisticUpdate } from 'alexs-redux-fetch/entities/actions';

cancelOptimisticUpdate('TODO/1/SAVE')
```

### Selectors

#### getById(state, entityName, id) -> (Entity | undefined)
Returns the entity for the given type and id.

If the entity has been optimistically updated, the object will have the added information
```js
{
  __optimistic: true
  __refs: [] // list of refs that have current optimistic updates for the entity
}
```

#### getAll -> []
Returns all entities currently stored for the given entityName.

Using this function isn't recommended, as it just does an Object.values(), it is probably better to keep a list of ids stored to loop through rather than getting all items*

For now you will need to create these lists of ids.

If the entity has been optimistically updated, the object will have the added information
```js
{
  __optimistic: true
  __refs: [] // list of refs that have current optimistic updates for the entity
}
```

#### getTimestamp(state, entityName, id) -> (timestamp | undefined)
Returns the timestamp of when the entity was last written into.

*Note: This doesn't take into account your reducers passed into createReducer*

#### getEditable(state, entityName) -> (Entity | undefined)
Returns the current editable entity.

#### createEntitySelectors(entityName, selectors = entitySelectors) -> {}
All of the above selectors are in the format (state, entityName, ...params). So to avoid passing in entityName each time, you can use createEntitySelectors to generate entity specific selectors.

You can also pass in your own selectors if you have added onto the provided entity selectors, your custom selectors must be in the format (state, entityName, ...params).
 
```js
const todoSelectors = createEntitySelectors('todo')

todoSelectors.getById(state, 123) // getById(state, 'todo', 123)
```

## Fetch

### Actions

#### fetch(Request|Success|Failure)(ref, payload = {}, meta = {})
Although you probably won't need to access these methods as fetchAction should cover most use cases, they are provided anyway.

Each generates a single action with the required meta data for the fetch reducers to detect.

Each action will generally look like this
```
{
  type: {ref}_(REQUEST|SUCCESS|FAILURE),
  payload,
  meta: {
    fetch: {
      type: (REQUEST|SUCCESS|FAILURE)
      ref
    }
  }
}
```

Each action will have the following effects

##### All
    - resets connection stats info (e.g. slow) 

##### Request
    - status for the given ref will be set to PENDING
    - timestamp for the given ref will be set to null
    
##### Success
    - status for the given ref will be set to LOADED
    - timestamp for the given ref will be set
    - resets failed count back to 0
    
##### Failure
    - status for the given ref will be set to FAILED
    - increases the failed count by 1

#### slowConnection(ref)
Again, like the individual fetch actions above, you probably won't need to use this, as it is bundled with the connectionStats thunk which is itself called from the fetchAction thunk.

Dispatching this action will list the ref as a slow request.

*Note: This gets reset any time one of the fetch actions is dispatched*

#### connectionStats(ref, promise, config) [thunk]
At the moment this async action just tracks slow requests, however it may be expanded in the future.

Config takes the options:
 - slowTimeout (default 3 seconds) - how long to wait before dispatching slowConnection

#### fetchAction(ref, promise, optimistic) [thunk]
This action handles the whole life cycle of an api request.

The steps this actions takes looks like
1. If optimistic provided, it will dispatch an optimisticUpdate
2. Dispatch fetchRequest
3. Dispatch connectionStats
4.  If promise resolves with an object with an 'error' ref, dispatches fetchFailure
    
    OR
    
    If promise resolves with an object with a 'response' ref, dispatches fetchSuccess

### Selectors

#### getStatus(state, ref) -> (NOT_LOADED | LOADED | PENDING | FAILED)
Returns the status of the api, if no status is in state this function will return NOT_LOADED.

#### getIsSlow(state, ref) -> Bool
Returns whether or not a ref is currently listed as slow.

#### getFailedAttempts(state, ref) -> Int
Returns the amount of failed attempts for the given ref

### Helpers

#### fetchType(ref) -> String
Returns the action type used for when an api with the provided ref has been called.

#### successType(ref) -> String
Returns the action type used for when an api with the provided ref is successful.

#### failedType(ref) -> String
Returns the action type used for when an api with the provided ref has failed.