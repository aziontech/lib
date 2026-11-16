import { notImplemented } from './_internal/not-implemented.js';

/**
 * `node:test` is the Node.js test runner, a development tool that does not run in the Azion runtime.
 * This stub only lets a bundle that imports it be built. Calling any API throws.
 */

export const describe = notImplemented('test.describe');
export const it = notImplemented('test.it');
export const suite = notImplemented('test.suite');
export const before = notImplemented('test.before');
export const after = notImplemented('test.after');
export const beforeEach = notImplemented('test.beforeEach');
export const afterEach = notImplemented('test.afterEach');
export const run = notImplemented('test.run');

export const mock = {
  fn: notImplemented('test.mock.fn'),
  method: notImplemented('test.mock.method'),
  getter: notImplemented('test.mock.getter'),
  setter: notImplemented('test.mock.setter'),
  module: notImplemented('test.mock.module'),
  reset: notImplemented('test.mock.reset'),
  restoreAll: notImplemented('test.mock.restoreAll'),
};

const test = notImplemented('test');

Object.assign(test, {
  test,
  describe,
  it,
  suite,
  before,
  after,
  beforeEach,
  afterEach,
  run,
  mock,
  skip: notImplemented('test.skip'),
  todo: notImplemented('test.todo'),
  only: notImplemented('test.only'),
});

export { test };

export default test;
