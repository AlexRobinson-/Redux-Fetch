import byId, { selectors as byIdSelectors } from './by-id';
import createByIdReducer from '../utils/create-by-id-reducer';
import timestamp, { selectors as timestampSelectors } from './timestamp';
import editable, { selectors as editableSelectors } from './editable';
import optimistic, { selectors as optimisticSelectors } from './optimistic'
import reducer, { createEntityReducer, selectors } from './index';

/**
 * Hackety hack hack
 */
function mockImport(defaultExport, namedExports) {
  Object.keys(namedExports).forEach(name => {
    defaultExport[name] = namedExports[name]
  })
  return defaultExport
}

jest.mock('./by-id', () => mockImport(
  jest.fn().mockReturnValue('byId reducer'),
  {
    selectors: {
      getById: jest.fn(),
      getAll: jest.fn()
    }
  }
))

jest.mock('./timestamp', () => mockImport(
  jest.fn().mockReturnValue('timestamp reducer'),
  {
    selectors: {}
  }
))

jest.mock('./editable', () => mockImport(
  jest.fn().mockReturnValue('editable reducer'),
  {
    selectors: {}
  }
))

jest.mock('./optimistic', () => mockImport(
  jest.fn().mockReturnValue('optimistic reducer'),
  {
    selectors: {
      getItemUpdates: jest.fn()
    }
  }
))

describe('entities root reducer', () => {
  describe('reducer', () => {
    let result

    beforeEach(() => {
      result = reducer(undefined, { type: 'SOME_ACTION' })
    })

    it('is composed of all sub reducers', () => {
      expect(result).toEqual({
        byId: 'byId reducer',
        timestamp: 'timestamp reducer',
        editable: 'editable reducer',
        optimistic: 'optimistic reducer'
      })
    })
  })

  describe('createEntityReducer', () => {
    let result
    beforeEach(() => {
      byId.mockReturnValue({ dog: 'dog reducer' })
      const entityReducer = createEntityReducer({
        cat: jest.fn().mockReturnValue('cat reducer')
      })
      result = entityReducer(undefined, { type: 'SOME_ACTION' })
    })

    it('is composed of all sub reducers + byId is wrapped in passed in entity reducers', () => {
      expect(result).toEqual({
        byId: {
          cat: 'cat reducer',
          dog: 'dog reducer'
        },
        timestamp: 'timestamp reducer',
        editable: 'editable reducer',
        optimistic: 'optimistic reducer'
      })
    })
  })

  describe('selectors', () => {
    describe('getById', () => {
      let result

      beforeEach(() => {
        byIdSelectors.getById.mockReturnValue({ name: 'The Cat', age: 2 })
        optimisticSelectors.getItemUpdates.mockReturnValue({ name: 'Mr. Cat' })
      })

      describe('when withOptimistic is true', () => {
        beforeEach(() => {
          result = selectors.getById('state', 'cat', 123, true)
        })

        it('gets the entity with optimistic updates on top', () => {
          expect(result).toEqual({ name: 'Mr. Cat', age: 2 })
        })
      })

      describe('when withOptimistic is false', () => {
        beforeEach(() => {
          result = selectors.getById('state', 'cat', 123, false)
        })

        it('returns the result of byId.getById', () => {
          expect(result).toEqual({ name: 'The Cat', age: 2 })
        })
      })
    })

    describe('getAll', () => {
      let result

      beforeEach(() => {
        byIdSelectors.getAll.mockReturnValue([{ name: 'The Cat', age: 2 }, { name: 'Another Cat', age: 3 }])
        optimisticSelectors.getItemUpdates.mockReturnValue({ name: 'Mr. Cat' })
      })

      describe('when withOptimistic is true', () => {
        beforeEach(() => {
          result = selectors.getAll('state', 'cat', true)
        })

        it('gets all entities with optimistic updates on top', () => {
          expect(result).toEqual([{ name: 'Mr. Cat', age: 2 }, { name: 'Mr. Cat', age: 3 }])
        })
      })

      describe('when withOptimistic is false', () => {
        beforeEach(() => {
          result = selectors.getAll('state', 'cat', false)
        })

        it('returns the result of byId.getAll', () => {
          expect(result).toEqual([{ name: 'The Cat', age: 2 }, { name: 'Another Cat', age: 3 }])
        })
      })
    })
  })
})
