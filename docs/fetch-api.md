# Fetch

## Actions

### fetchRequest(ref, payload = {}, meta = {})
Returns a fetch request action, which will make the following changes in the store:

  - resets connection stats info (e.g. slow)
  - status for the given ref will be set to PENDING
  - timestamp for the given ref will be set to null
    
### fetchSuccess(ref, payload = {}, meta = {})
Returns a fetch success action, which will make the following changes in the store:

  - resets connection stats info (e.g. slow)
  - status for the given ref will be set to LOADED
  - timestamp for the given ref will be set
  - resets failed count back to 0
    
### fetchFailure(ref, payload = {}, meta = {})
Returns a fetch failure action, which will make the following changes in the store:

   - resets connection stats info (e.g. slow)
   - status for the given ref will be set to FAILED
   - increases the failed count by 1
     
### fetchCancel(ref, payload = {}, meta = {})
Returns a fetch failure action, which will make the following changes in the store:

  - resets connection stats info (e.g. slow)
  - status for the given ref will be set to null
  - resets failed count back to 0    
  - cancels any optimistic updates for the given ref

### slowConnection(ref)
Again, like the individual fetch actions above, you probably won't need to use this, as it is bundled with the connectionStats thunk which is itself called from the fetchAction thunk.

Dispatching this action will list the ref as a slow request.

*Note: This gets reset any time one of the fetch actions is dispatched*

### connectionStats(ref, promise, config) [thunk]
At the moment this async action just tracks slow requests, however it may be expanded in the future.

Config takes the options:
 - slowTimeout (default 3 seconds) - how long to wait before dispatching slowConnection

### fetchAction(ref, promise, optimistic) [thunk]
This action handles the whole life cycle of an api request.

The steps this actions takes looks like
1. If optimistic provided, it will dispatch an optimisticUpdate
2. Dispatch fetchRequest
3. Dispatch connectionStats
4.  If promise resolves with an object with an 'error' ref, dispatches fetchFailure
    
    OR
    
    If promise resolves with an object with a 'response' ref, dispatches fetchSuccess

## Selectors

### getStatus(state, ref) -> (NOT_LOADED | LOADED | PENDING | FAILED)
Returns the status of the api, if no status is in state this function will return NOT_LOADED.

### getIsPending(state, ref) -> Bool
Returns whether or not a ref is currently pending.

### getIsSlow(state, ref) -> Bool
Returns whether or not a ref is currently listed as slow.

### getFailedAttempts(state, ref) -> Int
Returns the amount of failed attempts for the given ref

### getTimestamp(state, ref) -> timestamp
Returns the timestamp of the last successful api request for the given ref.

### getErrorMessage(state, ref) -> Any (Whatever you set as the error message)
Returns the error message for the give ref.


## Helpers

### requestType(ref) -> String
Returns the action type used for when an api with the provided ref has been called.

```js
import { requestType } from 'alexs-redux-fetch/fetch/helpers';

requestType('GET_TODOS'); // GET_TODOS_REQUEST
```

### successType(ref) -> String
Returns the action type used for when an api with the provided ref is successful.

```js
import { successType } from 'alexs-redux-fetch/fetch/helpers';

successType('GET_TODOS'); // GET_TODOS_SUCCESS
```

### failureType(ref) -> String
Returns the action type used for when an api with the provided ref has failed.

```js
import { failureType } from 'alexs-redux-fetch/fetch/helpers';

failureType('GET_TODOS'); // GET_TODOS_FAILURE
```

### cancelType(ref) -> String
Returns the action type used for when an api with the provided ref is cancelled.

```js
import { cancelType } from 'alexs-redux-fetch/fetch/helpers';

cancelType('GET_TODOS'); // GET_TODOS_CANCEL
```