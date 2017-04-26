import reducer, { selectors } from './optimistic';
import { OPTIMISTIC_UPDATE, CANCEL_OPTIMISTIC_UPDATE } from './../action-types';
import { FETCH_ACTION_TYPES } from './../../fetch';

describe('optimistic', () => {
  describe('reducer', () => {

    describe('root', () => {
      it('has all sub reducers', () => {
        expect(Object.keys(reducer(undefined, { type: 'SOME_ACTION' }))).toEqual(['updates', 'order'])
      })
    })

    describe('updates', () => {
      let result

      describe('initial state', () => {
        beforeEach(() => {
          result = reducer(undefined, { type: 'SOME_ACTION' }).updates;
        })

        it('is an empty object', () => {
          expect(result).toEqual({});
        })
      })

      describe(`when it receives action ${OPTIMISTIC_UPDATE}`, () => {
        const initialState = {
          updates: {
            SOME_OTHER_UPDATE: { some: 'stuff' }
          }
        }
        const action = {
          type: OPTIMISTIC_UPDATE,
          payload: {
            ref: 'some ref',
            optimisticEntities: {
              cat: {
                123: {
                  name: 'Mr. Cat'
                }
              }
            }
          }
        }

        beforeEach(() => {
          result = reducer(initialState, action).updates;
        })

        it('adds the update to the state, references by ref', () => {
          expect(result).toEqual({
            SOME_OTHER_UPDATE: { some: 'stuff' },
            [action.payload.ref]: action.payload.optimisticEntities
          })
        })
      })

      describe(`when it receives action ${CANCEL_OPTIMISTIC_UPDATE}`, () => {
        const initialState = {
          updates: {
            SOME_OTHER_UPDATE: { some: 'stuff' },
            SOME_UPDATE: { other: 'stuff' }
          }
        }
        const action = {
          type: OPTIMISTIC_UPDATE,
          payload: {
            ref: 'SOME_UPDATE',
          }
        }

        beforeEach(() => {
          result = reducer(initialState, action).updates;
        })

        it('removes the ref from the state', () => {
          expect(result).toEqual({ SOME_OTHER_UPDATE: { some: 'stuff' } })
        })
      });

      describe('when an action contains a successful fetch for a ref', () => {
        const initialState = {
          updates: {
            SOME_OTHER_UPDATE: { some: 'stuff' },
            SOME_UPDATE: { other: 'stuff' }
          }
        }
        const action = {
          type: 'SOME_ACTION',
          payload: {},
          meta: {
            fetch: {
              type: FETCH_ACTION_TYPES.SUCCESS,
              ref: 'SOME_UPDATE'
            }
          }
        }

        beforeEach(() => {
          result = reducer(initialState, action).updates;
        })

        it('removes the update', () => {
          expect(result).toEqual({ SOME_OTHER_UPDATE: { some: 'stuff' } });
        })
      })
    })

    describe('order', () => {
      let result

      describe('initial state', () => {
        beforeEach(() => {
          result = reducer(undefined, { type: 'SOME_ACTION' }).order;
        })

        it('is an empty array', () => {
          expect(result).toEqual([]);
        })
      })

      describe(`when it receives action with type ${OPTIMISTIC_UPDATE}`, () => {
        const initialState = { order: ['SOME_OTHER_UPDATE'] }
        const action = {
          type: OPTIMISTIC_UPDATE,
          payload: {
            ref: 'some ref',
            optimisticEntities: {
              cat: {
                123: {
                  name: 'Mr. Cat'
                }
              }
            }
          }
        }

        beforeEach(() => {
          result = reducer(initialState, action).order;
        })

        it('adds the ref to the end of the array', () => {
          expect(result).toEqual(['SOME_OTHER_UPDATE', action.payload.ref])
        })
      })

      describe(`when it receives action ${CANCEL_OPTIMISTIC_UPDATE}`, () => {
        const initialState = {
          updates: {
            SOME_OTHER_UPDATE: { some: 'stuff' },
            SOME_UPDATE: { other: 'stuff' }
          }
        }
        const action = {
          type: OPTIMISTIC_UPDATE,
          payload: {
            ref: 'SOME_UPDATE',
          }
        }

        beforeEach(() => {
          result = reducer(initialState, action).updates;
        })

        it('removes the ref from the state', () => {
          expect(result).toEqual({ SOME_OTHER_UPDATE: { some: 'stuff' } })
        })
      });

      describe('when an action contains a successful fetch for a ref', () => {
        const initialState = {
          order: ['SOME_OTHER_UPDATE', 'SOME_UPDATE']
        }
        const action = {
          type: 'SOME_ACTION',
          payload: {},
          meta: {
            fetch: {
              type: FETCH_ACTION_TYPES.SUCCESS,
              ref: 'SOME_UPDATE'
            }
          }
        }

        beforeEach(() => {
          result = reducer(initialState, action).order;
        })

        it('removes the ref from the array', () => {
          expect(result).toEqual(['SOME_OTHER_UPDATE']);
        })
      })
    })
  })

  describe('selectors', () => {
    describe('getItemUpdateForRef', () => {
      const state = {
        updates: {
          SOME_UPDATE: {
            cat: {
              123: {
                name: 'Mr. Cat'
              }
            }
          }
        }
      }
      let result

      beforeEach(() => {
        result = selectors.getItemUpdateForRef(state, 'cat', 123, 'SOME_UPDATE')
      })

      it('returns the update for the provided entity', () => {
        expect(result).toEqual({ name: 'Mr. Cat' })
      })
    })

    describe('getItemUpdates', () => {
      const state = {
        updates: {
          FIRST_UPDATE: {
            cat: {
              123: {
                name: 'The Cat',
                age: 2
              }
            }
          },
          SOME_UPDATE: {
            cat: {
              123: {
                name: 'Mr. Cat'
              }
            }
          }
        },
        order: ['FIRST_UPDATE', 'SOME_UPDATE']
      }
      let result

      beforeEach(() => {
        result = selectors.getItemUpdates(state, 'cat', 123)
      })


      it('returns all updates for the entity with the added optimistic data', () => {
        expect(result).toEqual({
          name: 'Mr. Cat',
          age: 2,
          __optimistic: true,
          __refs: ['FIRST_UPDATE', 'SOME_UPDATE']
        })
      })
    })
  })
})