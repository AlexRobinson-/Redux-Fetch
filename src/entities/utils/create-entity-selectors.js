import { selectors } from './../reducers';

const createEntitySelector = (type, baseSelectors = selectors) => Object.keys(baseSelectors).reduce(
  (entitySelectors, selector) => ({
    ...entitySelectors,
    [selector]: (state, ...params) => baseSelectors[selector](state, type, ...params)
  }), baseSelectors
);

export default createEntitySelector