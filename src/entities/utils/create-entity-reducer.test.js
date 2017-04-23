import createEntityReducer from './create-entity-reducer';

jest.mock('./../reducers/by-id', () => jest.fn(state => ({ ...state, some: 'state' })));
const byId = require('./../reducers/by-id');

describe('create-entity-reducer', () => {
  it('throws an error if not passed in an object', () => {
    expect(() => createEntityReducer(4)).toThrow();
  })

  it('returns a function', () => {
    expect(typeof createEntityReducer({})).toBe('function');
  })

  describe('reducer', () => {
    const initialState = { cat: 'cat-state', dog: 'dog-state' };
    const action = { type: 'SOME_ACTION' };
    const reducers = {
      cat: jest.fn().mockReturnValue('new-cat-state'),
      dog: jest.fn().mockReturnValue('new-dog-state')
    }
    let result;

    beforeEach(() => {
      const reducer = createEntityReducer(reducers);

      result = reducer(initialState, action);
    })

    it('calls byIdReducer with the state and action', () => {
      expect(byId).toHaveBeenCalledWith(initialState, action);
    })

    it('calls each sub-state with its corresponding sub-reducer', () => {
      expect(reducers.cat).toHaveBeenCalledWith('cat-state', action)
      expect(reducers.dog).toHaveBeenCalledWith('dog-state', action)
    })

    it('returns the combined states', () => {
      expect(result).toEqual({
        some: 'state',
        cat: 'new-cat-state',
        dog: 'new-dog-state'
      })
    })
  })
})