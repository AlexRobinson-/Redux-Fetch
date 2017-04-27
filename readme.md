# Redux Fetch
A set of redux actions/selectors/selectors to handle making api calls that fetch data and then storing that data.

## Usage

The library comes with two main reducers/modules

### Entities
A generic entity store based around the normalizr library that stores entities by their id, nested under their 'entityName' (e.g. users).

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
 - **Timestamp** For every entity added to the store, a timestamp is added to keep track of when the data was loaded.
 - **Optimistic** Allows you to optimistically update the entity store and roll back any failed/cancelled updates
 - **Editable** Allows you to have one editable entity at a time
 
### Fetch
This set of redux actions/reducers/selectors allow you to easily keep track of your api request states.

This module keeps track of the following information:
 - **Failed count** How many times the api has failed without a successful response
 - **Timestamp** Stores the timestamp of the last successful attempt for a given api
 - **Slow** Keeps track of slow requests, useful for showing the user that you acknowledge the request is taking a while

## Entities

### Actions

#### Editable

##### beginEditing(entityName, fields)
Assigns the fields to the editable entity

##### beginNew(entityName)
Sets the editable entity to an empty object

##### update
Merges the fields into the editable entity

##### stopEditing
Sets the editable entity to null

##### createEditActions(entityName)
Wraps all of the editable entity actions with the entityName

```js
const editableTodoActions = createEditActions('todo')

editableTodoActions.update({completed: false}) // update('todo', {completed: false})
```

#### Optimistic

#### optimisticUpdate(ref, entities)
Creates an optimistic update optimisticUpdate that can be referenced by the provided ref

#### cancelOptimisticUpdate(ref)
Cancels the optimistic update for the given ref

### Selectors

#### getById(state, entityName, id)
Returns the entity for the given type and id.

#### getAll
Returns all entities currently stored for the given entityName.

*Note: This isn't recommended, as it just does an Object.values(), it is probably better to keep a list of ids stored to loop through rather than getting all items*

#### getTimestamp(state, entityName, id)
Returns the timestamp of when the entity was last written into.

*Note: This doesn't take into account your reducers passed into createEntityReducer*

#### getEditable(state, entityName)
Returns the current editable entity.

#### createEntitySelector(entityName, selectors = entitySelectors)
Wraps all of the entity selectors, passing entityName in as the second param to each one.

You can also pass in your own selectors if you have added onto the provided entity selectors.
 
```js
const todoSelectors = createEntitySelectors('todo')

todo.getById(state, 123) // getById(state, 'todo', 123)
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
    - status for the given ref will be set to FETCHING
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

#### fetchAction(ref, promise, config) [thunk]
This action handles the whole life cycle of an api request.

1. If config.optimistic provided, it will dispatch an optimisticUpdate
2. Dispatch fetchRequest
3. Dispatch connectionStats
4.  If promise resolves with an object with an 'error' key, dispatches fetchFailure
    
    OR
    
    If promise resolves with an object with a 'response' key, dispatches fetchSuccess

### Selectors

#### getStatus

#### getIsSlow

#### getFailedAttempts