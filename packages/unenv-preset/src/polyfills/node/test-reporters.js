import { notImplemented } from './_internal/not-implemented.js';

/**
 * `node:test/reporters` belongs to the Node.js test runner, a development tool that does not run in
 * the Azion runtime. This stub only lets a bundle that imports it be built. Calling any reporter throws.
 */

export const dot = notImplemented('test/reporters.dot');
export const junit = notImplemented('test/reporters.junit');
export const lcov = notImplemented('test/reporters.lcov');
export const spec = notImplemented('test/reporters.spec');
export const tap = notImplemented('test/reporters.tap');

export default { dot, junit, lcov, spec, tap };
