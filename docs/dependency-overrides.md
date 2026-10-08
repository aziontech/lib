# Dependency overrides and `pnpm audit`

`pnpm audit` must report **no known vulnerabilities** for this repository. Most advisories are fixed by upgrading the
dependency that pulls in the vulnerable package; when that is not possible, the fix is an entry in `pnpm.overrides` of
the root [`package.json`](../package.json). This document explains the overrides that have a side effect, so that
nobody has to rediscover them.

Check the current state with:

```bash
pnpm audit
```

## Overrides that need attention

### `argparse` (advisory GHSA-hp3w-g68c-fv3c, `sprintf-js`)

`sprintf-js` has no patched release (the latest version, 1.1.3, is affected) and is reached only through
`argparse@1`. `argparse@2` does not depend on it, so two overrides move the dependents to it:

```json
"js-yaml@3>argparse": "^2.0.1",
"@rushstack/ts-command-line>argparse": "^2.0.1"
```

| Override | Used by | Effect |
| --- | --- | --- |
| `js-yaml@3>argparse` | `jest` > `babel-plugin-istanbul` > `@istanbuljs/load-nyc-config` > `js-yaml@3` | None. `js-yaml@3` only uses `argparse` in its own CLI (`bin/js-yaml.js`), never as a library. |
| `@rushstack/ts-command-line>argparse` | `vite-plugin-dts` > `@microsoft/api-extractor` > `@rushstack/ts-command-line` | **The `api-extractor` command line is broken** (see below). |

#### The `api-extractor` CLI does not work

`argparse@2` is a port of the Python library and is not compatible with the 1.x API that `@rushstack/ts-command-line`
was written against. Running the CLI fails with any subcommand:

```console
$ node node_modules/@microsoft/api-extractor/bin/api-extractor --help
api-extractor 7.59.0  - https://api-extractor.com/
Error: _StoreTrueAction() got an unexpected keyword argument 'metavar'
```

The build of this repository is **not** affected, because `vite-plugin-dts` uses the programmatic API
(`Extractor`, `ExtractorConfig`), which does not load `@rushstack/ts-command-line` or `argparse`. Every package builds
and generates its `.d.ts` files normally.

If you need to run the `api-extractor` binary (for example `api-extractor run` to produce an API report):

1. remove the `@rushstack/ts-command-line>argparse` override and run `pnpm install`;
2. `pnpm audit` will report GHSA-hp3w-g68c-fv3c again (moderate, dev tooling only), so decide how to handle it.

#### When to remove these overrides

Remove them when a patched `sprintf-js` is published, or when `@rushstack/ts-command-line` stops depending on
`argparse@1` (the latest, 5.3.17, still does). After removing them, run `pnpm install`, `pnpm audit` and
`pnpm -r compile`.

### `brace-expansion`

The overrides are bounded to a major line on purpose:

```json
"brace-expansion@1": "^1.1.17",
"brace-expansion@2": "^2.1.7",
"brace-expansion@5": "^5.0.12"
```

An open range such as `>=2.1.7` lets pnpm reuse a `5.x` release already in the lockfile for packages that expect the
`2.x` API (`minimatch@9`), so keep the `^` ranges.

## Advisories fixed without an override

| Advisory | Package | How it was fixed |
| --- | --- | --- |
| GHSA-vfj7-8cjw-p6xm | `braces` (no patched release) | `@aziontech/presets` uses `tinyglobby` instead of `fast-glob`, so `braces` is no longer part of the published packages. The dev tooling that also reached it (`@changesets/cli` 2.x and `@types/jest` 29) was upgraded to 3.x and 30. |

## Other overrides

`lodash`, `postcss`, `fast-uri`, `qs`, `esbuild`, `source-map-js`, `js-yaml`, `@babel/core` and
`@babel/plugin-transform-modules-systemjs` raise a transitive dependency to a patched release. They have no known
side effect; the advisory behind each one is in the commit that added it (`git log -S'"<package>"' -- package.json`).

## Adding or changing an override

1. Prefer upgrading the dependency that pulls in the vulnerable package.
2. Bound the range to the major line the dependents expect.
3. Run `pnpm install`, `pnpm audit`, `pnpm -r compile` and `pnpm -r test`.
4. If the override changes the major version of a package that something uses as a library, document the
   consequence here.
