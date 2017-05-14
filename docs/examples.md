# Examples

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Making api calls](#making-api-calls)
- [Making api calls your own way](#making-api-calls-your-own-way)
- [Listening in to fetch actions in your own reducers](#listening-in-to-fetch-actions-in-your-own-reducers)
- [Adding and updating entities](#adding-and-updating-entities)
- [Optimistic updates](#optimistic-updates)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Making api calls
Getting started tracking API calls with this library is rather easy with the built in `fetchAction` thunk action.

This function takes in three parameters

 - **Ref** The unique key for this api call
 - **Promise** Some promise (usually your fetch call)
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
4.  If promise is rejected, dispatches fetchFailure with the error's message
    
    OR
    
    If promise resolves, dispatches fetchSuccess

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

## Making api calls your own way
The provided fetchAction thunk is pretty basic

```js
export const fetchAction = (ref, promise, optimistic) =>
  (dispatch, getState) => new Promise(res => {
      if (optimistic) {
        dispatch(optimisticUpdate(ref, optimistic));
      }
      dispatch(fetchRequest(ref));
      dispatch(connectionStats(ref, promise));

      promise
        .then(
          response => {
            dispatch(fetchSuccess(ref, response));
  
            res({ response });
          }
        )
        .catch(err => {
          const error = err.message;
          dispatch(fetchFailure(ref, { error }));
          res({ error });
        })
    })
```

However, if you aren't using redux thunk, or if you want to implement your own logic, please feel free to build your own fetchActions!

Maybe you don't care about optimisticUpdates or connection stats and instead of rejecting a promise you resolve with an 'error' and 'response' attribute.

That's fine, just build up your own.

```js
export const fetchAction = (ref, promise) => async (dispatch, getState) => {
  dispatch(fetchRequest(ref));
  
  const { response, error } = await promise;
  
  if (error) {
    dispatch(fetchFailure(ref, { error }));
    return;
   }
   
  dispatch(fetchSuccess(ref, response));
}
```

## Listening in to fetch actions in your own reducers
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


## Adding and updating entities
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

## Optimistic updates
To perform an optimistic update, the action creator `optimisticUpdate` has been provided.

This function takes two parameters,
 1. The ref the optimistic update is for
 2. The normalized entities that you expect to receive for the given ref is successful
 
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
