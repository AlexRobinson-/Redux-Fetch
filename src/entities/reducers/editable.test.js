import reducer, { selectors } from './editable';
import {
  BEGIN_EDITING,
  BEGIN_NEW,
  UPDATE_EDITABLE,
  STOP_EDITING
} from './../action-types';

describe('editable', () => {

  describe('reducer', () => {
    const initialState = {
      cat: {
        id: 123,
        name: 'Mr. Cat'
      }
    }

    describe('initial state', () => {
      it('is an empty object', () => {
        expect(reducer(undefined, { type: 'whatever' })).toEqual({});
      })
    })

    describe(`when action is type ${BEGIN_NEW}`, () => {
      const action = {
        type: BEGIN_NEW,
        payload: {
          entityName: 'cat'
        }
      }
      let result

      beforeEach(() => {
        result = reducer(initialState, action)
      })

      it('sets the entity to an empty object', () => {
        expect(result).toEqual({ cat: {} })
      })
    })

    describe(`when action is type ${BEGIN_EDITING}`, () => {
      const action = {
        type: BEGIN_EDITING,
        payload: {
          entityName: 'cat',
          fields: {
            id: 124,
            age: 2
          }
        }
      }
      let result

      beforeEach(() => {
        result = reducer(initialState, action)
      })

      it('sets the entity to the action\'s fields', () => {
        expect(result).toEqual({ cat: { id: 124, age: 2 } });
      })
    })

    describe(`when action is type ${UPDATE_EDITABLE}`, () => {
      const action = {
        type: UPDATE_EDITABLE,
        payload: {
          entityName: 'cat',
          fields: {
            age: 2
          }
        }
      }
      let result

      beforeEach(() => {
        result = reducer(initialState, action)
      })

      it('merges the entity with the action\'s fields', () => {
        expect(result).toEqual({ cat: { id: 123, name: 'Mr. Cat', age: 2 } });
      })
    })

    describe(`when action is type ${STOP_EDITING}`, () => {
      const action = {
        type: STOP_EDITING,
        payload: {
          entityName: 'cat'
        }
      }
      let result

      beforeEach(() => {
        result = reducer(initialState, action)
      })

      it('sets the entity to null', () => {
        expect(result).toEqual({ cat: null });
      })
    })

    describe('when an action other than the editing actions contains entities', () => {
      describe('and it has an entity whose id is the same as we are editing', () => {
        const action = {
          type: 'WHATEVER',
          payload: {
            entities: {
              cat: {
                123: {
                  age: 2
                }
              }
            }
          }
        }
        let result

        beforeEach(() => {
          result = reducer(initialState, action)
        })

        it('merges the received entity with the editable entity', () => {
          expect(result).toEqual({ cat: { id: 123, name: 'Mr. Cat', age: 2 } })
        })
      })

      describe('and it does not have an entity whose id is the same as we are editing', () => {
        const action = {
          type: 'WHATEVER',
          payload: {
            entities: {
              cat: {
                124: {
                  age: 2
                }
              }
            }
          }
        }
        let result

        beforeEach(() => {
          result = reducer(initialState, action)
        })

        it('returns the original state', () => {
          expect(result).toEqual(initialState)
        })
      })
    })
  })

  describe('selectors', () => {
    describe('getEditable', () => {
      const state = {
        cat: {
          id: 123,
          name: 'Mr. Cat'
        }
      }
      let result

      beforeEach(() => {
        result = selectors.getEditable(state, 'cat')
      })

      it('returns the editable entity', () => {
        expect(result).toEqual({ id: 123, name: 'Mr. Cat' })
      })
    })
  })
})