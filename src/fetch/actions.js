import action from 'alexs-redux-helpers/actions'
import {
  SLOW_CONNECTION,
  REQUEST,
  SUCCESS,
  FAILURE
} from './constants'
import { selectors } from './reducer'

export const slowConnection = ref => action(SLOW_CONNECTION, { ref })

const _fetchAction = (payload = {}, meta = {}, ref, status) => action(
  `${ref}_${status}`,
  payload,
  { ...meta, fetch: { ref, type: status } }
)

export const fetchRequest = (ref, payload, meta) => _fetchAction(payload, meta, ref, REQUEST)
export const fetchSuccess = (ref, payload, meta) => _fetchAction(payload, meta, ref, SUCCESS)
export const fetchFailure = (ref, payload, meta) => _fetchAction(payload, meta, ref, FAILURE)

const slowConnectionTimer = () => new Promise(res => {
  setTimeout(() => res({ slow: true }), 3000)
})

const wrapPromise = promise => new Promise(
  res => {
    promise.then(response => {
      res({ response })
    })
  }
)

export const connectionStats = (ref, promise) => dispatch => {
  /* Check for a slow connection */
  Promise.race([
    wrapPromise(promise),
    slowConnectionTimer()
  ])
    .then(({ slow }) => {
        if (slow) {
          dispatch(slowConnection(ref))
        }
      }
    )
}

export const optimisticUpdate = (ref, optimisticEntities) => action(
  'OPTIMISTIC_UPDATE',
  {
    ref,
    optimisticEntities
  }
)

export const cancelOptimisticUpdate = ref => action(
  'CANCEL_OPTIMISTIC_UPDATE',
  {
    ref
  }
)

export const fetchAction = (ref, promise, { fetchSelectors = selectors, optimistic } = {}) =>
  (dispatch, getState) =>
    new Promise(res => {
      if (fetchSelectors.getIsLoading(getState(), ref)) {
        return;
      }

      if (optimistic) {
        dispatch(optimisticUpdate(ref, optimistic))
      }
      dispatch(fetchRequest(ref))
      dispatch(connectionStats(ref, promise))

      promise.then(
        ({ response, error }) => {
          if (error) {
            dispatch(fetchFailure(ref))
            return { error }
          }

          dispatch(fetchSuccess(ref, response))

          res({ response })
        }
      )
    })