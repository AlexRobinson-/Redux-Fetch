import action from 'alexs-redux-helpers/actions'
import {
  SLOW_CONNECTION,
  REQUEST,
  SUCCESS,
  FAILURE,
  CANCEL
} from './constants'
import { optimisticUpdate } from './../entities/actions';

export const slowConnection = ref => action(SLOW_CONNECTION, { ref })

const createFetchAction = (payload = {}, meta = {}, ref, status) => action(
  `${ref}_${status}`,
  payload,
  { ...meta, fetch: { ref, type: status } }
)

export const fetchRequest = (ref, payload, meta) => createFetchAction(payload, meta, ref, REQUEST)
export const fetchSuccess = (ref, payload, meta) => createFetchAction(payload, meta, ref, SUCCESS)
export const fetchFailure = (ref, payload, meta) => createFetchAction(payload, meta, ref, FAILURE)
export const fetchCancel = (ref, payload, meta) => createFetchAction(payload, meta, ref, CANCEL)

const slowConnectionTimer = timeout => new Promise(res => {
  setTimeout(() => res({ slow: true }), timeout)
})

const wrapPromise = promise => new Promise(
  res => {
    promise
      .then(response => {
        res({ response })
      })
      .catch(err => {
        res({ error: err && err.message })
      })
  }
)

export const connectionStats = (ref, promise, { slowTimeout = 3000 } = {}) => dispatch => {
  /* Check for a slow connection */
  Promise.race([
    wrapPromise(promise),
    slowConnectionTimer(slowTimeout)
  ])
    .then(({ slow }) => {
        if (slow) {
          dispatch(slowConnection(ref))
        }
      }
    )
}

export const fetchAction = (ref, promise, optimistic) =>
  (dispatch, getState) =>
    new Promise(res => {
      if (optimistic) {
        dispatch(optimisticUpdate(ref, optimistic))
      }
      dispatch(fetchRequest(ref))

      dispatch(connectionStats(ref, promise))

      promise
        .then(
          response => {
            dispatch(fetchSuccess(ref, response))

            res({ response })
          }
        )
        .catch(err => {
          const error = err.message;
          dispatch(fetchFailure(ref, { error }))
          res({ error })
        })
    })