import action from 'alexs-redux-helpers/actions';
import {
  BEGIN_EDITING,
  BEGIN_NEW,
  UPDATE_EDITABLE,
  STOP_EDITING,
  OPTIMISTIC_UPDATE,
  CANCEL_OPTIMISTIC_UPDATE
} from './action-types';

/**
 * Editable
 */
const editActions = ({
  beginEditing: (entityName, fields) => action(BEGIN_EDITING, { entityName, fields }),
  beginNew: (entityName) => action(BEGIN_NEW, { entityName }),
  update: (entityName, fields = {}) => action(UPDATE_EDITABLE, { entityName, fields }),
  stopEditing: entityName => action(STOP_EDITING, { entityName })
});

export const createEditActions = entityName => Object.keys(editActions).reduce(
  (actions, actionName) => ({
    ...actions,
    [actionName]: (...params) => editActions[actionName](entityName, ...params)
  }), {}
);

/**
 * Optimistic
 */
export const optimisticUpdate = (ref, optimisticEntities) => action(
  OPTIMISTIC_UPDATE,
  {
    ref,
    optimisticEntities
  }
)

export const cancelOptimisticUpdate = ref => action(CANCEL_OPTIMISTIC_UPDATE, { ref })


