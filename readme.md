# Redux Fetch
A set of redux actions/selectors/reducers to handle making api calls that fetch data and then storing that data.

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

This thunk action will perform the following:
1. If optimistic provided, it will dispatch `optimisticUpdate`
2. Dispatch `fetchRequest`
3. Dispatch `connectionStats`
4.  If promise resolves with an object with an 'error' attribute, dispatches `fetchFailure`
    
    OR
    
    If promise resolves with an object with a 'response' attribute, dispatches `fetchSuccess`

Keeping it simple, lets consider if we just wanted to keep track of the status of our todo api call (we will ignore optimistic updates and connection stats for now).

When we call the `fetchTodo` it will first dispatch the `fetchRequest` action. This will put the ref `TODO/${id}/GET` into a `PENDING` state.
 
We can use the selector `getIsPending` to check if the ref is pending.

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

#### Listening in to fetch actions in your own reducers
Sometimes you may want to have your own reducers react to the fetch actions being created via this library.

All of the fetch actions that are dispatched are of the format `${ref}_${type}`.

This means that when a fetchRequest action is dispatched, the type of that action is `${ref}_REQUEST`.

If for example, our ref was 'FETCH_ALL_THE_THINGS', the following action types that can be dispatched are:
- FETCH_ALL_THE_THINGS_REQUEST
- FETCH_ALL_THE_THINGS_SUCCESS
- FETCH_ALL_THE_THINGS_FAILURE
- FETCH_ALL_THE_THINGS_CANCEL

However, with any library this may change some time in the future, so instead of hard coding the strings yourself, functions are provided by this library to create the aciton type.

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
#### Editing entities
#### Fresh data
