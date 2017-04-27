# Redux Fetch
A set of redux actions/selectors/selectors to handle making api calls that fetch data and then storing that data.

## Usage

## Entities

### Actions

#### Editable

##### beginEditing(entityName, fields)
Assigns the fields to the entity

```js
beginEditing('todo', {title: 'Do stuff'})

updatedStore = {
  todo: {
    title: 'Do Stuff'
  }
}
```

##### beginNew(entityName)
Sets the entity to an empty object

```js
beginNew('todo')

updatedStore = {
  todo: {}
}
```

##### update
Merges the fields into the entity

```js
initialStore = {
  todo: {
    title: 'Do Stuff',
    completed: true
  }
}

update('todo', {completed: false})

updatedStore = {
  todo: {
    title: 'Do Stuff',
    completed: false
  }
}
```


##### stopEditing
Sets the entity to null

```js
stopEditing('todo')

updatedStore = {
  todo: null
}
```

##### createEditActions(entityName)
Wraps all of the editable entity actions with the entityName

```js
const editableTodoActions = createEditActions('todo')

editableTodoActions.update({completed: false}) // update('todo', {completed: false})
```

#### Optimistic

#### optimisticUpdate(ref, entities)
Creates an optimistic update optimisticUpdate that can be references by the ref

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
4a. If promise resolves with an object with an 'error' key, dispatches fetchFailure
4b. OR If promise resolves with an object with a 'response' key, dispatches fetchSuccess

### Selectors

#### getStatus

#### getIsSlow

#### getFailedAttempts