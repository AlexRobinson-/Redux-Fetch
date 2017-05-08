import action from 'alexs-redux-helpers/actions';
import {
  BEGIN_EDITING,
  BEGIN_NEW,
  UPDATE_EDITABLE,
  STOP_EDITING,
  OPTIMISTIC_UPDATE,
  CANCEL_OPTIMISTIC_UPDATE
} from './action-types';
import {
  CANCEL_REQUEST
} from './../fetch/constants';

/**
 * Editable
 */
export const beginEditing = (entityName, fields) => action(BEGIN_EDITING, { entityName, fields });
export const beginNew = (entityName) => action(BEGIN_NEW, { entityName });
export const update = (entityName, fields = {}) => action(UPDATE_EDITABLE, { entityName, fields });
export const stopEditing = entityName => action(STOP_EDITING, { entityName });

const editActions = ({
  beginEditing,
  beginNew,
  update,
  stopEditing
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

export const cancelOptimisticUpdate = ref => action(CANCEL_OPTIMISTIC_UPDATE, { ref }, { ref, type: CANCEL_REQUEST })


