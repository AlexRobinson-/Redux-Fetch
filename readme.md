# Redux Fetch
A set of actions/reducers to handle making api calls that fetch data and then storing that data.

## Usage

## Entities

### Actions

#### Editable

##### beginEditing

##### beginNew

##### update

##### stopEditing

### Selectors

#### createEntitySelector

#### getById

#### getAll

#### getTimestamp

#### getEditable

## Fetch

### Actions

#### fetchRequest

#### fetchSuccess

#### fetchFailure

#### optimisticUpdate

#### cancelOptimisticUpdate

#### slowConnection

#### connectionStats (thunk)

#### fetchAction (thunk)

### Selectors

#### getStatus

#### getIsSlow

#### getFailedAttempts