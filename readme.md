# Redux Fetch
A set of redux actions/selectors/reducers that helps you with all things api.

This includes:
- Keeping track of the state of your api calls (pending, success, failed)
- Storing your data in a generic normalized store
- Performing optimistic updates on your data
- Doing local edits on data before persisting to the server
 
## Docs
 - [Getting Started](#getting-started)
 - [Core Api](docs/core-api.md)
 - [Fetch Api](docs/fetch-api.md)
 - [Entities Api](docs/entities-api.md)
 - [Examples](docs/examples.md)

An example project using this library can be found here: [Redux Fetch Example](https://github.com/AlexRobinson-/redux-fetch-example)

Note: This is still in development, breaking changes will continue until I bump it up to V2.
Once this project reaches V2 it will start following semantic versions.

## Overview
This library comes with two separate, but related features: 'Fetch' and 'Entities'.

The general idea behind them is:
- **Fetch** handles making and tracking the status of api calls.
- **Entities** handles storing, editing and optimistically updating pieces of data

The specific information each has includes:

### Fetch
 - **Failed count** How many times the api has failed without a successful response
 - **Timestamp** When the last successful attempt for a given api was
 - **Slow Connections** If a single request takes too long
 - **Error** The error message of the last failed attempt
 
### Entities
 - **Normalized** Stores the entities by their entityName + id
 - **Optimistic** Allows you to optimistically update the entity store and roll back any failed/cancelled updates
 - **Editable** Allows you to have one editable entity per entity type at a time
 - **Timestamp** For every entity added to the store, a timestamp is added to keep track of when the data was last put into the redux store.
 
## Getting Started
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
Import `createReducer` from the library and add it into your root reducer.

*Look at the createReducer docs in the [core api](docs/core-api.md#createreducerbyidreducers--entityselectors) for more you can do with this*

```js
// your root reducer
import createReducer from 'alexs-redux-fetch';

export default combineReducers({
  ..., // your other reducers,
  api: createReducer()
})
```

### 4. Using the fetch actions
If you are using redux thunk, the [fetchAction](docs/fetch-api.md#fetchactionref-promise-optimistic-thunk) is a quick way to get started.
This action will handle dispatching all of the necessary functions for you to:
 - Keep track of your api's status (pending, success, failed)
 - Check if your api is taking a long time
 - Performing an optimistic update
 
However, if you would prefer to handle all of this yourself [(which is totally fine)](docs/examples.md#making-api-calls-your-own-way) there are non-thunk actions provided as well.

The way the fetch feature keeps track of your individual api calls is via a unique ref.
It is recommended that you create ref generator functions to easily produce these refs.

```js
import { fetchAction, fetchRequest, fetchSuccess, fetchFailure } from 'alexs-redux-fetch/fetch/actions';

const fetchTodoApi = id => api(`/todos/${id}`)
const fetchTodoRef = id => `/TODO/${id}/GET`;

const saveTodoApi = (id, fields) => api.post(`/todos/${id}`, fields)
const saveTodoRef = id => `/TODO/${id}/SAVE`;

const removeTodoApi = id => api
  .delete(`/todos/${id}`)
  .then(response => ({ response }))
  .then(err => ({ error: err.message }))

const removeTodoRef = id => `/TODO/${id}/REMOVE`;

/* Using fetchAction thunk */

export const fetchTodo = id => fetchAction(
  fetchTodoRef(id),
  fetchTodoApi(id)
);

export const saveTodo = (id, fields) => fetchAction(
  saveTodoRef(id),
  saveTodoApi(id, fields)
);

/* Rolling your own */

export const removeTodo = id => async dispatch => {
  const ref = removeTodoRef(id);
  
  dispatch(fetchRequest(ref))
  
  const { response, error } = await removeTodoApi(id);
  
  if (error) {
    dispatch(fetchFailure(ref, { error }))
    return;
  }
  
  dispatch(fetchSuccess(ref, response))
}
```

### 5. Add some entities
The concept of entities in this library is based on the [normalizr](https://github.com/paularmstrong/normalizr) library (it is even encouraged to use it), all entities are stored by their entity type and then their their id.

Please note though, this library does not offer any way to store lists of ids as is normal for the normalized pattern, this is up to you to implement for now.

To add entities into the store, dispatch any action with the payload `entities`, where entities is the normalized data.

```js
// Without normalizr
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

// With normalizr
dispatch({
  type: 'SOME_ACTION',
  payload: {
    ...normalize([{id: 2, title: 'Do other stuff', completed: false}], [todoSchema])
  }
})
```

### 6. Set up your selectors (optional, but recommended)

#### Entity Selectors

The easiest way to use the entity selectors is with the createEntitySelectors, which generates selectors for a specific entity.

createEntitySelectors function takes three parameters
- Entity name - the name of the entity you want to create selectors for. This will also be the name you use with the normalizr library
- Get state (optional) - A function that returns the sub-state for where you keep this library (defaults to returning the passed in state)
- Selectors (optional - should be rarely used) - The selectors you want to generate for the entity (will default to the the packages selectors, look at documentation for more information).

```js
// wherever-you-keep-selectors.js
import { createEntitySelector } from 'alexs-redux-fetch';

export const todoSelectors = createEntitySelector('todo', state => state.api);
export const userSelectors = createEntitySelector('user', state => state.api);
```

#### Fetch Selectors

To generate the fetch selectors use createFetchSelectors, which takes one argument to get the state.   

```js
// wherever-you-keep-selectors.js
import { createFetchSelectors } from 'alexs-redux-fetch';

export const fetchSelectors = createFetchSelectors(state => state.api);
```

### 7. Set up your api code (optional)
As mentioned in the above section, the entity reducer will use any entities from the action payload.

So to make your action files a little cleaner, add your normalization code to your api functions.

Example:
```js
// /api/todo.js

import { schema, normalize } from 'normalizr';

const { Entity } = schema;

export const Todo = new Entity('todo');

export const fetchAll = () => api('/todos')
  .then(response => normalize(response, [Todo]));
  
// /actions/todo.js

import { fetchAction } from 'alexs-redux-fetch/fetch/actions';
import * as todoApi from '/api/todo';

export const fetchTodos = () => fetchAction('ALL_TODOS', todoApi.fetchAll())
```



