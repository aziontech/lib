import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import addKeywords from 'ajv-keywords';

import v3Schema from './v3/schemas/schema';
import { schemaManifest as v3Manifest } from './v3/schemas/schemaManifest';
import v4Schema from './v4/schemas/schema';
import { schemaManifest as v4Manifest } from './v4/schemas/schemaManifest';
import v6Schema from './v6/schemas/schema';
import { schemaManifest as v6Manifest } from './v6/schemas/schemaManifest';

// The validators compile the whole schema of a version on every call, even if the config does not use a resource, so a
// schema that breaks the strict mode of ajv (e.g. `pattern` without `type: 'string'`) warns for every config.
// Jest only prints the console of a failing suite, so the warnings are captured here and checked.
function compileWarnings(schema: Record<string, unknown>) {
  const warnings: string[] = [];
  const ajv = new Ajv({
    allErrors: true,
    $data: true,
    allowUnionTypes: true,
    logger: {
      log: () => undefined,
      warn: (message: unknown) => warnings.push(String(message)),
      error: (message: unknown) => warnings.push(String(message)),
    },
  });
  ajvErrors(ajv);
  addKeywords(ajv, ['instanceof']);
  ajv.compile(schema);
  return warnings;
}

describe('schemas compile in the strict mode of ajv', () => {
  it.each([
    ['v3 config', v3Schema],
    ['v3 manifest', v3Manifest],
    ['v4 config', v4Schema],
    ['v4 manifest', v4Manifest],
    ['v6 config', v6Schema],
    ['v6 manifest', v6Manifest],
  ])('%s has no warnings', (_name, schema) => {
    expect(compileWarnings(schema as Record<string, unknown>)).toEqual([]);
  });

  it('catches a schema that breaks the strict mode', () => {
    const warnings = compileWarnings({ type: 'object', properties: { items: { pattern: '^[0-9]+$' } } });

    expect(warnings.join('\n')).toContain('missing type "string" for keyword "pattern"');
  });
});
