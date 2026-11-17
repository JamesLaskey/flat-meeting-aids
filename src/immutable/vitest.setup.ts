import { expect } from 'vitest';
import { is, isImmutable } from 'immutable';

expect.addEqualityTesters([
  (a, b) => {
    if (isImmutable(a) && isImmutable(b)) {
      return is(a, b);
    }
    return undefined;
  },
]);