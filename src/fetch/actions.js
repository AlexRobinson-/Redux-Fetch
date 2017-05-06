import action from 'alexs-redux-helpers/actions'
import {
  SLOW_CONNECTION,
  REQUEST,
  SUCCESS,
  FAILURE
} from './constants'
import { selectors } from './reducer'
import { optimisticUpdate } from './../entities/actions';

export const slowConnection = ref => action(SLOW_CONNECTION, { ref })

const _fetchAction = (payload = {}, meta = {}, ref, status) => action(
  `${ref}_${status}`,
  payload,
  { ...meta, fetch: { ref, type: status } }
)

export const fetchRequest = (ref, payload, meta) => _fetchAction(payload, meta, ref, REQUEST)
export const fetchSuccess = (ref, payload, meta) => _fetchAction(payload, meta, ref, SUCCESS)
export const fetchFailure = (ref, payload, meta) => _fetchAction(payload, meta, ref, FAILURE)

const slowConnectionTimer = timeout => new Promise(res => {
  setTimeout(() => res({ slow: true }), timeout)
})

const wrapPromise = promise => new Promise(
  res => {
    promise.then(response => {
      res({ response })
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

export const fetchAction = (ref, promise, { optimistic } = {}) =>
  (dispatch, getState) =>
    new Promise(res => {
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