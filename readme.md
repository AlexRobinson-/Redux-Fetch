# Redux Fetch
A set of redux actions/selectors/reducers to handle tracking api calls and normalized data.

An example project using this library can be found here: [Redux Fetch Example](https://github.com/AlexRobinson-/redux-fetch-example)

Note: This is still in development, breaking changes will continue until I bump it up to V2.
Once this project reaches V2 it will start following semantic versioning.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Overview](#overview)
  - [Fetch](#fetch)
  - [Entities](#entities)
- [Setting Up](#setting-up)
  - [1. Pre-requisites](#1-pre-requisites)
  - [2. Install the library](#2-install-the-library)
  - [3. Add the reducer to your root reducer](#3-add-the-reducer-to-your-root-reducer)
  - [4. Set up your selectors (optional, but recommended)](#4-set-up-your-selectors-optional-but-recommended)
    - [Entity Selectors](#entity-selectors)
    - [Fetch Selectors](#fetch-selectors)
  - [5. Using the fetch actions](#5-using-the-fetch-actions)
  - [6. Set up your api code (optional)](#6-set-up-your-api-code-optional)
- [Usage](#usage)
  - [Fetch](#fetch-1)
    - [Making api calls](#making-api-calls)
    - [Making api calls your own way](#making-api-calls-your-own-way)
    - [Listening in to fetch actions in your own reducers](#listening-in-to-fetch-actions-in-your-own-reducers)
  - [Entities](#entities-1)
    - [Adding and updating entities](#adding-and-updating-entities)
    - [Optimistic updates](#optimistic-updates)
- [Api](#api)
  - [Core](#core)
    - [createReducer(byIdReducers - optional)](#createreducerbyidreducers---optional)
  - [Entities](#entities-2)
    - [Actions](#actions)
      - [Editable](#editable)
        - [beginEditing(entityName, fields)](#begineditingentityname-fields)
        - [beginNew(entityName)](#beginnewentityname)
        - [update](#update)
        - [stopEditing](#stopediting)
        - [createEditActions(entityName)](#createeditactionsentityname)
      - [Optimistic Updates](#optimistic-updates)
        - [optimisticUpdate(ref, entities)](#optimisticupdateref-entities)
        - [cancelOptimisticUpdate(ref)](#canceloptimisticupdateref)
    - [Selectors](#selectors)
      - [getById(state, entityName, id) -> (Entity | undefined)](#getbyidstate-entityname-id---entity--undefined)
      - [getAll(state, entityName) -> []](#getallstate-entityname---)
      - [getTimestamp(state, entityName, id) -> (timestamp | undefined)](#gettimestampstate-entityname-id---timestamp--undefined)
      - [getEditable(state, entityName) -> (Entity | undefined)](#geteditablestate-entityname---entity--undefined)
      - [createEntitySelectors(entityName, selectors = entitySelectors) -> {}](#createentityselectorsentityname-selectors--entityselectors---)
    - [Helpers](#helpers)
      - [hasEntities (action) -> Bool](#hasentities-action---bool)
      - [getAllEntities (action) -> {}](#getallentities-action---)
      - [getEntities (action, entityName) -> {}](#getentities-action-entityname---)
      - [updateEntity (state, id, (entity) -> updatedEntity) -> {}](#updateentity-state-id-entity---updatedentity---)
  - [Fetch](#fetch-2)
    - [Actions](#actions-1)
      - [fetchRequest(ref, payload = {}, meta = {})](#fetchrequestref-payload---meta--)
      - [fetchSuccess(ref, payload = {}, meta = {})](#fetchsuccessref-payload---meta--)
      - [fetchFailure(ref, payload = {}, meta = {})](#fetchfailureref-payload---meta--)
      - [fetchCancel(ref, payload = {}, meta = {})](#fetchcancelref-payload---meta--)
      - [slowConnection(ref)](#slowconnectionref)
      - [connectionStats(ref, promise, config) [thunk]](#connectionstatsref-promise-config-thunk)
      - [fetchAction(ref, promise, optimistic) [thunk]](#fetchactionref-promise-optimistic-thunk)
    - [Selectors](#selectors-1)
      - [getStatus(state, ref) -> (NOT_LOADED | LOADED | PENDING | FAILED)](#getstatusstate-ref---not_loaded--loaded--pending--failed)
      - [getIsPending(state, ref) -> Bool](#getispendingstate-ref---bool)
      - [getIsSlow(state, ref) -> Bool](#getisslowstate-ref---bool)
      - [getFailedAttempts(state, ref) -> Int](#getfailedattemptsstate-ref---int)
      - [getTimestamp(state, ref) -> timestamp](#gettimestampstate-ref---timestamp)
      - [getErrorMessage(state, ref) -> Any (Whatever you set as the error message)](#geterrormessagestate-ref---any-whatever-you-set-as-the-error-message)
    - [Helpers](#helpers-1)
      - [requestType(ref) -> String](#requesttyperef---string)
      - [successType(ref) -> String](#successtyperef---string)
      - [failureType(ref) -> String](#failuretyperef---string)
      - [cancelType(ref) -> String](#canceltyperef---string)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview
This library comes with two main features: 'Fetch' and 'Entities'.

The general idea behind them is:
- **Entities** handles storing, editing and optimistically updating pieces of data
- **Fetch** handles making and tracking the status of api calls.

The specific information each contains includes:

### Fetch
 - **Failed count** How many times the api has failed without a successful response
 - **Timestamp** When the last successful attempt for a given api was
 - **Slow Connections** If a single request takes too long
 - **Error** The error message of the last failed attempt
 
### Entities
 - **Timestamp** For every entity added to the store, a timestamp is added to keep track of when the data was last put into the redux store.
 - **Optimistic** Allows you to optimistically update the entity store and roll back any failed/cancelled updates
 - **Editable** Allows you to have one editable entity per entity type at a time

## Setting Up
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
The entity and fetch selectors are provided seperately, so in whichever file you keep your selectors:

#### Entity Selectors

The easiest way to use the entity selectors is with the createEntitySelectors, which generates selectors for a specific entity.

createEntitySelectors function takes three parameters
- Entity name - the name of the entity you want to create selectors for. This will also be the name you use with the normalizr library
- Get state (optional) - A function that returns the sub-state for where you keep this library (defaults to returning the passed in state)
- Selectors (optional - should be rarely used) - The selectors you want to generate for the entity (will default to the the packages selectors, look at documentation for more information).

```js
// wherever-you-keep-selectors.js (I normally keep them in same file as their reducer)
import { createEntitySelector } from 'alexs-redux-fetch';


export const todoSelectors = createEntitySelector('todo', state => state.api);
export const userSelectors = createEntitySelector('user', state => state.api);
```

#### Fetch Selectors

To use the fetch selectors use createFetchSelectors, which takes one argument to get the state.   

```js
// wherever-you-keep-selectors.js (I normally keep them in same file as their reducer)
import { createFetchSelectors } from 'alexs-redux-fetch';

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
  fetchTodoApi(id)
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

Note: the fetchAction thunk is expecting your api/promise to resolve with an object with either a response or error attribute. This can be added to the api code as well.

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

## Usage

### Fetch

#### Making api calls
Getting started tracking API calls with this library is rather easy with the built in `fetchAction` thunk action.

This function takes in three parameters

 - **Ref** The unique key for this api call
 - **Promise** Some promise (usually your fetch call) that resolves with either a `response` or `error` attribute.
 - **Optimistic** (optional) The optimistic update for this api call (see optimistic docs for more info about this)
  
Using it will look something like this

```js
import { fetchAction } from 'alexs-redux-fetch/fetch/actions';

export const fetchTodo = id => fetchAction(
  `TODO/${id}/GET`,
  fetch(`/todo/${id}`).then(res => res.json())
)
```

This thunk action will perform the following steps:
1. If optimistic provided, it will dispatch `optimisticUpdate`
2. Dispatch `fetchRequest`
3. Dispatch thunk `connectionStats`
4.  If promise resolves with an object with an 'error' attribute, dispatches `fetchFailure`
    
    OR
    
    If promise resolves with an object with a 'response' attribute, dispatches `fetchSuccess`

Keeping it simple, lets consider if we just wanted to keep track of the status of our todo api call (we will ignore optimistic updates and connection stats for now).

When we call our `fetchTodo` action creator it will first dispatch the `fetchRequest` action. This will put the ref `TODO/${id}/GET` into a `PENDING` state.
 
We can use the selector `getIsPending` to check this.

```js
import React from 'react';
import { connect } from 'react-redux';
import { fetchSelectors, todoSelectors } from './selectors';

const Todo = ({isPending, todo}) => {
  if (isPending) {
    return <div>Loading...</div>;
  }
  
  return <div>{todo.title}</div>;
};

export default connect(
  (state, ownProps) => ({
    todo: todoSelectors.getById(state, ownProps.todoId),
    isPending: fetchSelectors.getIsPending(state, `TODO/${ownProps.todoId}/GET`)
  })
)(Todo);
```

When the api resolves, if it resolved with a `response` attribute, a `fetchSuccess` action will be dispatched, otherwise a `fetchFailure` action is dispatched.

When a `fetchSuccess` action is dispatched, the ref will be marked as `SUCCESS`.
When a `fetchFailure` action is dispatched, the ref will be marked as `FAILED`.

Although it can be useful to know when an api call is successful, keep in mind that a single piece of data can be loaded in via a range of api calls, so it may be best to not conditionally display data based on this.

We can use a few other selectors to now display an error state as well.

```js
import React from 'react';
import { connect } from 'react-redux';
import { fetchSelectors, todoSelectors } from './selectors';

const Todo = ({isPending, hasFailed, error, todo}) => {
  if (isPending) {
    return <div>Loading...</div>;
  }
  
  if (hasFailed) {
    return <div>Error: {error}</div>;
  }
  
  // assume it exists
  return <div>{todo.title}</div>;
};

export default connect(
  (state, ownProps) => ({
    todo: todoSelectors.getById(state, ownProps.todoId),
    isPending: fetchSelectors.getIsPending(state, `TODO/${ownProps.todoId}/GET`),
    hasFailed: fetchSelectors.getHasFailed(state, `TODO/${ownProps.todoId}/GET`),
    error: fetchSelectors.getErrorMessage(state, `TODO/${ownProps.todoId}/GET`)
  })
)(Todo);
```

#### Making api calls your own way
The provided fetchAction thunk is pretty basic

```js
export const fetchAction = (ref, promise, optimistic) =>
  (dispatch, getState) => new Promise(res => {
      if (optimistic) {
        dispatch(optimisticUpdate(ref, optimistic))
      }
      dispatch(fetchRequest(ref))
      dispatch(connectionStats(ref, promise))

      promise.then(
        ({ response, error }) => {
          if (error) {
            dispatch(fetchFailure(ref, { error }))
            res({ error })
            return
          }

          dispatch(fetchSuccess(ref, response))

          res({ response })
        }
      )
    })
```

However, if you aren't using redux thunk, or if you want to implement your own logic, please feel free to build your own fetchActions!

Maybe you don't care about optimisticUpdates or connection stats and all of your api's reject the promise rather than resolving with an `error` attribute.

That's fine, just build up your own.

```js
export const fetchAction = (ref, promise) => async (dispatch, getState) => {
  dispatch(fetchRequest(ref))
  
  try {
    const response = await promise;
    dispatch(fetchSuccess(ref, response))
    
  } catch(err) {
    dispatch(fetchFailure(ref, { error: err.message }))
  }
}
```

#### Listening in to fetch actions in your own reducers
Sometimes you may want to have your own reducers react to the fetch actions being created via this library.

All of the fetch actions that are dispatched are of the format `${ref}_${type}`.

This means that when a fetchRequest action is dispatched, the type of that action is `${ref}_REQUEST`.

If for example, our ref was 'FETCH_ALL_THE_THINGS', the following action types that can be dispatched are:
- FETCH_ALL_THE_THINGS_REQUEST
- FETCH_ALL_THE_THINGS_SUCCESS
- FETCH_ALL_THE_THINGS_FAILURE
- FETCH_ALL_THE_THINGS_CANCEL

However, with any library this may change in the future, so instead of hard coding the strings yourself, functions are provided by this library to create the action type.

These functions are:
 - successType
 - pendingType
 - failedType
 - cancelType 
 
Each take the ref as a parameter and return the action type.

An example of using this:

```js
import { successType } from 'alexs-redux-fetch/fetch';

const isLoggedIn = (state = false, action) => {
  switch(action.type) {
    case successType('LOGIN'):
      return true;
    case successType('LOGOUT'):
      return false;
    default:
      return state;
  }
}
```


### Entities

#### Adding and updating entities
Adding and updating entities into the store is very simple, all that is required is an action with entities in its payload.

As the entities are based on the `normalizr` library, the entities must be in the shape of:
```
{
  entityName: {
    id: entiity
  }
}
```

For example, to add some todos into your app
```js
dispatch({
  type: 'ADD_TODOS',
  payload: {
    entities: {
      todo: {
        1: {
          id: 1,
          title: 'Do stuff'
        },
        2: {
          id: 2,
          title: 'Write docs'
        },
        3: {
          id: 3,
          title: 'Sleep'
        }
      }
    }
  }
})
```

Using the entity selectors, we can create a simple component to display the todos we just created

```js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { todoSelectors } from './selectors';

class Todos extends Component {
  
  componentWillMount() {
    this.props.dispatch({
      type: 'ADD_TODOS',
      payload: {
        entities: {
          todo: {
            1: {
              id: 1,
              title: 'Do stuff',
              completed: true
            },
            2: {
              id: 2,
              title: 'Write docs',
              completed: false
            },
            3: {
              id: 3,
              title: 'Sleep'
              completed: false
            }
          }
        }
      }
    })
  }
    
  render() {
    return (
      <div>
        <h2>Todos</h2>
        {
          this.props.todos(todo => (
            <div>{todo.title} {todo.completed ? 'Completed' : 'Todo'}</div>
          ))
        }
      </div>
    );
  }
}

export default connect(
  state => ({
    todos: todoSelectors.getAll(state)
  })
)(Todos)
```

When dispatching an action with entities, the reducer currently merges in the entities rather than overwriting what is currently there.
This means in order to update an entity you just need to dispatch whatever information you want to be merged in to the store.

For example, in order to update a todo item to be completed, you just need to dispatch
```js
dispatch({
  type: 'UPDATE_TODO',
  payload: {
    entities: {
      todo: {
        1: {
          completed: true
        }
      }
    }
  }
})
```

#### Optimistic updates
To perform an optimistic update, the action creator `optimisticUpdate` has been provided.

This function takes two parameters,
 1. The ref the optimistic update is for
 2. The normalized entities that you expect to receive for the given ref
 
The way optimistic updates are used within the library are, after you have performed an optimistic update, when you use a selector to get an entity or entities from the store.
The provided selectors will check to see if there are any optimistic updates for the entity. If there are, the updates will be merged into the entity and the following properties added to the entity object:

- **__refs** An array of all the refs that have an optimistic update for the entity
- **__optimistic** This will be set to true, used as a way to identify if an entity has optimistic attributes

In practice this could be used like so
```js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { optimisticUpdate } from 'alexs-redux-fetch';
import { todoSelectors } from './selectors';

class Todos extends Component {
  
  componentWillMount() {
    this.props.dispatch({
      type: 'ADD_TODOS',
      payload: {
        entities: {
          todo: {
            1: {
              id: 1,
              title: 'Do stuff',
              completed: true
            }
          }
        }
      }
    });
    
    this.props.dispatch(optimisticUpdate(
        'TODO/1/UPDATE', {
          todo: { 
            1: {
              completed: false
            }
          }
        }
    ));
  }
    
  render() {
    return (
      <div>
        <h2>Todos</h2>
        {
          this.props.todos(todo => (
            <div>
              <span>{todo.title}</span>
              <span>{todo.completed ? 'Completed' : 'Todo'}</span>
              {
                todo.__optimistic && todo.__refs.includes('TODO/1/UPDATE') && (
                  <span>Saving...</span>
                )
              }
            </div>
          ))
        }
      </div>
    );
  }
}

export default connect(
  state => ({
    todos: todoSelectors.getAll(state)
  })
)(Todos)
```

To cancel an optimistic update, simply dispatch `fetchCancel` which will remove it from the store.

```js
import { fetchCancel } from 'alexs-redux-fetch/fetch';

dispatch(
  fetchCancel('TODO/1/UPDATE')
);
```
Also note, since an optimistic update is tied to a specific ref, only one optimistic update can be created per ref. If a second optimistic update is dispatched, the first one will be overwritten.

## Api

### Core

#### createReducer(byIdReducers - optional)
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

### Entities

#### Actions

##### Editable

###### beginEditing(entityName, fields)
Assigns the fields to the editable entity

```js
import { beginEditing } from 'alexs-redux-fetch/entities/actions';

beginEditing('todo', {id: '123', title: 'Do stuff'})
```

###### beginNew(entityName)
Sets the editable entity to an empty object

```js
import { beginNew } from 'alexs-redux-fetch/entities/actions';

beginNew('todo')
```

###### update
Merges the fields into the editable entity

```js
import { update } from 'alexs-redux-fetch/entities/actions';

update('todo', {title: 'Do other stuff'})
```

###### stopEditing
Sets the editable entity to null

```js
import { stopEditing } from 'alexs-redux-fetch/entities/actions';

stopEditing('todo')
```

###### createEditActions(entityName)
Wraps all of the editable entity actions with the entityName

```js
import { createEditActions } from 'alexs-redux-fetch/entities/actions';

const editTodoActions = createEditActions('todo')

editTodoActions.update({completed: false})

```

##### Optimistic Updates

###### optimisticUpdate(ref, entities)
Creates an optimistic update optimisticUpdate that can be referenced by the provided ref.

```js
import { schema, normalize } from 'normalizr';
import { optimisticUpdate } from 'alexs-redux-fetch/entities/actions';

const todo = new schema.Entity('todo');

optimisticUpdate('TODO/1/SAVE', normalize({id: 1, completed: false}, todo).entities)
```

###### cancelOptimisticUpdate(ref)
Cancels the optimistic update for the given ref

*Note: This now just calls fetchCancel*

```js
import { cancelOptimisticUpdate } from 'alexs-redux-fetch/entities/actions';

cancelOptimisticUpdate('TODO/1/SAVE')
```

#### Selectors

##### getById(state, entityName, id) -> (Entity | undefined)
Returns the entity for the given type and id.

If the entity has been optimistically updated, the object will have the added information
```js
{
  __optimistic: true
  __refs: [] // list of refs that have current optimistic updates for the entity
}
```

##### getAll(state, entityName) -> []
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

##### getTimestamp(state, entityName, id) -> (timestamp | undefined)
Returns the timestamp of when the entity was last written into.

*Note: This doesn't take into account your reducers passed into createReducer*

##### getEditable(state, entityName) -> (Entity | undefined)
Returns the current editable entity.

##### createEntitySelectors(entityName, selectors = entitySelectors) -> {}
All of the above selectors are in the format (state, entityName, ...params). So to avoid passing in entityName each time, you can use createEntitySelectors to generate entity specific selectors.

You can also pass in your own selectors if you have added onto the provided entity selectors, your custom selectors must be in the format (state, entityName, ...params).
 
```js
const todoSelectors = createEntitySelectors('todo')

todoSelectors.getById(state, 123) // getById(state, 'todo', 123)
```

#### Helpers

##### hasEntities (action) -> Bool
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

##### getAllEntities (action) -> {}
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

##### getEntities (action, entityName) -> {}
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

##### updateEntity (state, id, (entity) -> updatedEntity) -> {}
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

### Fetch

#### Actions

##### fetchRequest(ref, payload = {}, meta = {})
Returns a fetch request action, which will make the following changes in the store:

    - resets connection stats info (e.g. slow)
    - status for the given ref will be set to PENDING
    - timestamp for the given ref will be set to null
    
##### fetchSuccess(ref, payload = {}, meta = {})
Returns a fetch success action, which will make the following changes in the store:

    - resets connection stats info (e.g. slow)
    - status for the given ref will be set to LOADED
    - timestamp for the given ref will be set
    - resets failed count back to 0
    
##### fetchFailure(ref, payload = {}, meta = {})
Returns a fetch failure action, which will make the following changes in the store:

     - resets connection stats info (e.g. slow)
     - status for the given ref will be set to FAILED
     - increases the failed count by 1
     
##### fetchCancel(ref, payload = {}, meta = {})
Returns a fetch failure action, which will make the following changes in the store:

    - resets connection stats info (e.g. slow)
    - status for the given ref will be set to null
    - resets failed count back to 0    
    - cancels any optimistic updates for the given ref

##### slowConnection(ref)
Again, like the individual fetch actions above, you probably won't need to use this, as it is bundled with the connectionStats thunk which is itself called from the fetchAction thunk.

Dispatching this action will list the ref as a slow request.

*Note: This gets reset any time one of the fetch actions is dispatched*

##### connectionStats(ref, promise, config) [thunk]
At the moment this async action just tracks slow requests, however it may be expanded in the future.

Config takes the options:
 - slowTimeout (default 3 seconds) - how long to wait before dispatching slowConnection

##### fetchAction(ref, promise, optimistic) [thunk]
This action handles the whole life cycle of an api request.

The steps this actions takes looks like
1. If optimistic provided, it will dispatch an optimisticUpdate
2. Dispatch fetchRequest
3. Dispatch connectionStats
4.  If promise resolves with an object with an 'error' ref, dispatches fetchFailure
    
    OR
    
    If promise resolves with an object with a 'response' ref, dispatches fetchSuccess

#### Selectors

##### getStatus(state, ref) -> (NOT_LOADED | LOADED | PENDING | FAILED)
Returns the status of the api, if no status is in state this function will return NOT_LOADED.

##### getIsPending(state, ref) -> Bool
Returns whether or not a ref is currently pending.

##### getIsSlow(state, ref) -> Bool
Returns whether or not a ref is currently listed as slow.

##### getFailedAttempts(state, ref) -> Int
Returns the amount of failed attempts for the given ref

##### getTimestamp(state, ref) -> timestamp
Returns the timestamp of the last successful api request for the given ref.

##### getErrorMessage(state, ref) -> Any (Whatever you set as the error message)
Returns the error message for the give ref.


#### Helpers

##### requestType(ref) -> String
Returns the action type used for when an api with the provided ref has been called.

```js
import { requestType } from 'alexs-redux-fetch/fetch/helpers';

requestType('GET_TODOS'); // GET_TODOS_REQUEST
```

##### successType(ref) -> String
Returns the action type used for when an api with the provided ref is successful.

```js
import { successType } from 'alexs-redux-fetch/fetch/helpers';

successType('GET_TODOS'); // GET_TODOS_SUCCESS
```

##### failureType(ref) -> String
Returns the action type used for when an api with the provided ref has failed.

```js
import { failureType } from 'alexs-redux-fetch/fetch/helpers';

failureType('GET_TODOS'); // GET_TODOS_FAILURE
```

##### cancelType(ref) -> String
Returns the action type used for when an api with the provided ref is cancelled.

```js
import { cancelType } from 'alexs-redux-fetch/fetch/helpers';

cancelType('GET_TODOS'); // GET_TODOS_CANCEL
```
