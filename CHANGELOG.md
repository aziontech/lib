### [1.20.4](https://github.com/aziontech/lib/compare/v1.20.3...v1.20.4) (2025-09-12)


### Bug Fixes

* storage pkg - error handling and get object based on content type (#223) ([03a8d68](https://github.com/aziontech/lib/commit/03a8d68ef78de012599dccab91e24b70e31aa7e0))

### [1.20.3](https://github.com/aziontech/lib/compare/v1.20.2...v1.20.3) (2025-09-12)


### Bug Fixes

* add maintenance branch ([3fe0abd](https://github.com/aziontech/lib/commit/3fe0abd112359dc98044d4bb184c59811bdbee63))
* update maintenance branch (only accept fix) ([a37fd2c](https://github.com/aziontech/lib/commit/a37fd2c2b6900a76be9eee54708d67197c99b750))

### [1.20.2](https://github.com/aziontech/lib/compare/v1.20.1...v1.20.2) (2025-07-16)


### Bug Fixes

* add getRandomValues, randomUUID and generateKeyPair crypto to runtime dev ([033957d](https://github.com/aziontech/lib/commit/033957d4982de299f2a62cb7988ff8590bf9c836))

### [1.20.1](https://github.com/aziontech/lib/compare/v1.20.0...v1.20.1) (2025-06-27)


### Bug Fixes

* **config:** rm validation function from defineConfig method (#184) ([f4e6a22](https://github.com/aziontech/lib/commit/f4e6a2288ec75763af2296757dd0c0fde29d9bcd))

### [1.20.1-stage.1](https://github.com/aziontech/lib/compare/v1.20.0...v1.20.1-stage.1) (2025-06-27)


### Bug Fixes

* **config:** rm validation function from defineConfig method (#184) ([f4e6a22](https://github.com/aziontech/lib/commit/f4e6a2288ec75763af2296757dd0c0fde29d9bcd))

## [1.20.0](https://github.com/aziontech/lib/compare/v1.19.1...v1.20.0) (2025-06-25)


### Features

* add OpenNextjs preset (#179) ([ca726ad](https://github.com/aziontech/lib/commit/ca726adc772783520e3fa9aa7f39b5beb812c8b1))
* add type safety for storage edge_access parameter ([a450f78](https://github.com/aziontech/lib/commit/a450f78a63a7cb4263ddf29a1f4679cbe92416af))
* **config:** azion api v4 (#161) ([49c3f02](https://github.com/aziontech/lib/commit/49c3f02aa39d5e24eb2141db2370a26e63f8fe10))
* purge api v4 (#167) ([f779d6a](https://github.com/aziontech/lib/commit/f779d6af4f2c9fd03fdce45d851f72347c21f3b9))
* upgrade unenv 1.x to 2.x (#159) ([60ef725](https://github.com/aziontech/lib/commit/60ef7255d78c4f922b8d3efdc8cd4518a54ffaff))


### Bug Fixes

* add Azion.Storage to globalThis for polyfill (#163) ([cd659db](https://github.com/aziontech/lib/commit/cd659dbd9afbbe5a7ed45e0d89f59e0fb76792d5))
* add polyfill for clearInterval and update injection in unenv preset (#172) ([ea99874](https://github.com/aziontech/lib/commit/ea99874afcab25e0144b374938f704b2e9205987))
* api v4  (#168) ([dc33e5a](https://github.com/aziontech/lib/commit/dc33e5a9cfe9bd069d5bb5fd61fe026ddde53dcb))
* polyfills for Node.js compatibility (#170) ([329f4c4](https://github.com/aziontech/lib/commit/329f4c41af43f8bf9ccede25a14605a8f34bdc35))
* **presets:** add missing prebuild command in preact preset ([8674785](https://github.com/aziontech/lib/commit/86747855fc8f7297d9a937a3c1eff190eb8a5def))
* **presets:** astro prebuild ([846990f](https://github.com/aziontech/lib/commit/846990f63f4b194e5f9b3e82c687be8f9ede1a65))
* **preset:** update ruleset of html preset ([90b0def](https://github.com/aziontech/lib/commit/90b0def35c64370cc67c523f5ef95bb2979663b6))
* rename skipProjectBuild to skipFrameworkBuild in BuildContext (#180) ([5252f0a](https://github.com/aziontech/lib/commit/5252f0acfb43a296bcdd291524a5b62de01df75d))
* revert exported name (presets) ([94a1739](https://github.com/aziontech/lib/commit/94a173990515dc17fcc954baa3542c4645a6fb59))
* rm worker property ([8673494](https://github.com/aziontech/lib/commit/8673494eb1cf86de4544a7791db9524866b7ddbb))
* streamline OpenNextjs prebuild execution by removing conditional checks for production (#181) ([8d513d9](https://github.com/aziontech/lib/commit/8d513d9e902225b949fe34354807b7a7a50a2a5d))
* streamline stream polyfills and enhance process, module, setInterval (#169) ([118f7bb](https://github.com/aziontech/lib/commit/118f7bb5ae501df4eb1c8e96fed7a976fcbb7f5d))
* wasm-image-processor resize wrapper (#164) ([a02d941](https://github.com/aziontech/lib/commit/a02d941c90360f1b8c10076ccb2b761f3ce62f2e))


### Reverts

* api v4  (#176) ([e93e073](https://github.com/aziontech/lib/commit/e93e07306609e3df88ffce7e4a56cf2f414f2640))

## [1.20.0-stage.18](https://github.com/aziontech/lib/compare/v1.20.0-stage.17...v1.20.0-stage.18) (2025-06-25)


### Features

* add type safety for storage edge_access parameter ([a450f78](https://github.com/aziontech/lib/commit/a450f78a63a7cb4263ddf29a1f4679cbe92416af))

## [1.20.0-stage.17](https://github.com/aziontech/lib/compare/v1.20.0-stage.16...v1.20.0-stage.17) (2025-06-24)


### Bug Fixes

* streamline OpenNextjs prebuild execution by removing conditional checks for production (#181) ([8d513d9](https://github.com/aziontech/lib/commit/8d513d9e902225b949fe34354807b7a7a50a2a5d))

## [1.20.0-stage.16](https://github.com/aziontech/lib/compare/v1.20.0-stage.15...v1.20.0-stage.16) (2025-06-20)


### Bug Fixes

* rename skipProjectBuild to skipFrameworkBuild in BuildContext (#180) ([5252f0a](https://github.com/aziontech/lib/commit/5252f0acfb43a296bcdd291524a5b62de01df75d))

## [1.20.0-stage.15](https://github.com/aziontech/lib/compare/v1.20.0-stage.14...v1.20.0-stage.15) (2025-06-20)


### Bug Fixes

* **presets:** astro prebuild ([846990f](https://github.com/aziontech/lib/commit/846990f63f4b194e5f9b3e82c687be8f9ede1a65))
* rm worker property ([8673494](https://github.com/aziontech/lib/commit/8673494eb1cf86de4544a7791db9524866b7ddbb))

## [1.20.0-stage.14](https://github.com/aziontech/lib/compare/v1.20.0-stage.13...v1.20.0-stage.14) (2025-06-20)


### Features

* add OpenNextjs preset (#179) ([ca726ad](https://github.com/aziontech/lib/commit/ca726adc772783520e3fa9aa7f39b5beb812c8b1))

## [1.20.0-stage.13](https://github.com/aziontech/lib/compare/v1.20.0-stage.12...v1.20.0-stage.13) (2025-06-20)


### Bug Fixes

* **preset:** update ruleset of html preset ([90b0def](https://github.com/aziontech/lib/commit/90b0def35c64370cc67c523f5ef95bb2979663b6))

## [1.20.0-stage.12](https://github.com/aziontech/lib/compare/v1.20.0-stage.11...v1.20.0-stage.12) (2025-06-18)


### Reverts

* api v4  (#176) ([e93e073](https://github.com/aziontech/lib/commit/e93e07306609e3df88ffce7e4a56cf2f414f2640))

## [1.20.0-stage.11](https://github.com/aziontech/lib/compare/v1.20.0-stage.10...v1.20.0-stage.11) (2025-06-18)


### Bug Fixes

* **presets:** add missing prebuild command in preact preset ([8674785](https://github.com/aziontech/lib/commit/86747855fc8f7297d9a937a3c1eff190eb8a5def))

## [1.20.0-stage.10](https://github.com/aziontech/lib/compare/v1.20.0-stage.9...v1.20.0-stage.10) (2025-06-09)


### Bug Fixes

* add polyfill for clearInterval and update injection in unenv preset (#172) ([ea99874](https://github.com/aziontech/lib/commit/ea99874afcab25e0144b374938f704b2e9205987))

## [1.20.0-stage.9](https://github.com/aziontech/lib/compare/v1.20.0-stage.8...v1.20.0-stage.9) (2025-06-06)


### Bug Fixes

* polyfills for Node.js compatibility (#170) ([329f4c4](https://github.com/aziontech/lib/commit/329f4c41af43f8bf9ccede25a14605a8f34bdc35))

## [1.20.0-stage.8](https://github.com/aziontech/lib/compare/v1.20.0-stage.7...v1.20.0-stage.8) (2025-06-03)


### Bug Fixes

* api v4  (#168) ([dc33e5a](https://github.com/aziontech/lib/commit/dc33e5a9cfe9bd069d5bb5fd61fe026ddde53dcb))

## [1.20.0-stage.7](https://github.com/aziontech/lib/compare/v1.20.0-stage.6...v1.20.0-stage.7) (2025-06-02)


### Bug Fixes

* streamline stream polyfills and enhance process, module, setInterval (#169) ([118f7bb](https://github.com/aziontech/lib/commit/118f7bb5ae501df4eb1c8e96fed7a976fcbb7f5d))

## [1.20.0-stage.6](https://github.com/aziontech/lib/compare/v1.20.0-stage.5...v1.20.0-stage.6) (2025-05-28)


### Features

* purge api v4 (#167) ([f779d6a](https://github.com/aziontech/lib/commit/f779d6af4f2c9fd03fdce45d851f72347c21f3b9))

## [1.20.0-stage.5](https://github.com/aziontech/lib/compare/v1.20.0-stage.4...v1.20.0-stage.5) (2025-05-28)


### Bug Fixes

* revert exported name (presets) ([94a1739](https://github.com/aziontech/lib/commit/94a173990515dc17fcc954baa3542c4645a6fb59))

## [1.20.0-stage.4](https://github.com/aziontech/lib/compare/v1.20.0-stage.3...v1.20.0-stage.4) (2025-05-27)


### Features

* **config:** azion api v4 (#161) ([49c3f02](https://github.com/aziontech/lib/commit/49c3f02aa39d5e24eb2141db2370a26e63f8fe10))

## [1.20.0-stage.3](https://github.com/aziontech/lib/compare/v1.20.0-stage.2...v1.20.0-stage.3) (2025-05-15)


### Bug Fixes

* wasm-image-processor resize wrapper (#164) ([a02d941](https://github.com/aziontech/lib/commit/a02d941c90360f1b8c10076ccb2b761f3ce62f2e))

## [1.20.0-stage.2](https://github.com/aziontech/lib/compare/v1.20.0-stage.1...v1.20.0-stage.2) (2025-05-13)


### Bug Fixes

* add Azion.Storage to globalThis for polyfill (#163) ([cd659db](https://github.com/aziontech/lib/commit/cd659dbd9afbbe5a7ed45e0d89f59e0fb76792d5))

## [1.20.0-stage.1](https://github.com/aziontech/lib/compare/v1.19.1...v1.20.0-stage.1) (2025-05-05)


### Features

* upgrade unenv 1.x to 2.x (#159) ([60ef725](https://github.com/aziontech/lib/commit/60ef7255d78c4f922b8d3efdc8cd4518a54ffaff))

### [1.19.1](https://github.com/aziontech/lib/compare/v1.19.0...v1.19.1) (2025-04-22)


### Bug Fixes

*  azion.config.js schema  (#155) ([d2da8a2](https://github.com/aziontech/lib/commit/d2da8a240178d689726a4db9ed6d4b2de588e834))
* rm cli bin reference (#157) ([74083da](https://github.com/aziontech/lib/commit/74083dadfef0bbb6757f2d8f3b7b53b7e7c75684))

### [1.19.1-stage.2](https://github.com/aziontech/lib/compare/v1.19.1-stage.1...v1.19.1-stage.2) (2025-04-22)


### Bug Fixes

* rm cli bin reference (#157) ([74083da](https://github.com/aziontech/lib/commit/74083dadfef0bbb6757f2d8f3b7b53b7e7c75684))

### [1.19.1-stage.1](https://github.com/aziontech/lib/compare/v1.19.0...v1.19.1-stage.1) (2025-04-22)


### Bug Fixes

*  azion.config.js schema  (#155) ([d2da8a2](https://github.com/aziontech/lib/commit/d2da8a240178d689726a4db9ed6d4b2de588e834))

## [1.19.0](https://github.com/aziontech/lib/compare/v1.18.2...v1.19.0) (2025-04-16)


### Features

* instantiation multiple function in iac ([9084c75](https://github.com/aziontech/lib/commit/9084c753d398f3df2d4051cbec2ab58ca54bab50))

## [1.19.0-stage.1](https://github.com/aziontech/lib/compare/v1.18.2...v1.19.0-stage.1) (2025-04-16)


### Features

* instantiation multiple function in iac ([9084c75](https://github.com/aziontech/lib/commit/9084c753d398f3df2d4051cbec2ab58ca54bab50))

### [1.18.2](https://github.com/aziontech/lib/compare/v1.18.1...v1.18.2) (2025-04-14)


### Bug Fixes

* **nextjs-preset:** handle missing files in app-path-routes-manifest ([2587069](https://github.com/aziontech/lib/commit/2587069df973078dffd33e4a5d3dee698d332014))

### [1.18.2-stage.1](https://github.com/aziontech/lib/compare/v1.18.1...v1.18.2-stage.1) (2025-04-11)


### Bug Fixes

* **nextjs-preset:** handle missing files in app-path-routes-manifest ([2587069](https://github.com/aziontech/lib/commit/2587069df973078dffd33e4a5d3dee698d332014))

### [1.18.1](https://github.com/aziontech/lib/compare/v1.18.0...v1.18.1) (2025-04-10)


### Bug Fixes

* force release  v1.18.0 ([c4b2fff](https://github.com/aziontech/lib/commit/c4b2fff3daf4e22ac4191ea9d663d8394df7b77b))

## [1.18.0-stage.3](https://github.com/aziontech/lib/compare/v1.18.0-stage.2...v1.18.0-stage.3) (2025-04-04)


### Features

* **config:** accept multiple entrypoints for build (#149) ([556173e](https://github.com/aziontech/lib/commit/556173e8ca51eb47e36b17de5861d8a9ec8026c9))

## [1.18.0-stage.2](https://github.com/aziontech/lib/compare/v1.18.0-stage.1...v1.18.0-stage.2) (2025-04-04)


### Reverts

* Revert "feat(config): accept multiple entrypoints for build (#148)" ([daad9db](https://github.com/aziontech/lib/commit/daad9db1e7504029ff5d3d2cadc2c2646cc2439b))
* Revert "chore(release): 1.18.0-stage.1" ([f458098](https://github.com/aziontech/lib/commit/f458098f90f016fe084d767d7f7ad150b2b01d43))

### [1.17.4](https://github.com/aziontech/lib/compare/v1.17.3...v1.17.4) (2025-03-26)


### Bug Fixes

* enable TypeScript declaration file generation in tsup configuration (#146) ([0947751](https://github.com/aziontech/lib/commit/0947751bdbc095ac529002c645aac20d705e855d))

### [1.17.4-stage.1](https://github.com/aziontech/lib/compare/v1.17.3...v1.17.4-stage.1) (2025-03-26)


### Bug Fixes

* enable TypeScript declaration file generation in tsup configuration (#146) ([0947751](https://github.com/aziontech/lib/commit/0947751bdbc095ac529002c645aac20d705e855d))

### [1.17.3](https://github.com/aziontech/lib/compare/v1.17.2...v1.17.3) (2025-03-25)


### Bug Fixes

* update package exports and scripts for improved module resolution and TypeScript support (#144) ([574bf3c](https://github.com/aziontech/lib/commit/574bf3c39a4b3a15145a3e3d534ea89e3ff55364))

### [1.17.3-stage.1](https://github.com/aziontech/lib/compare/v1.17.2...v1.17.3-stage.1) (2025-03-25)


### Bug Fixes

* update package exports and scripts for improved module resolution and TypeScript support (#144) ([574bf3c](https://github.com/aziontech/lib/commit/574bf3c39a4b3a15145a3e3d534ea89e3ff55364))

### [1.17.2](https://github.com/aziontech/lib/compare/v1.17.1...v1.17.2) (2025-03-25)


### Bug Fixes

* add Babel presets for TypeScript support and remove ts-loader ([9371950](https://github.com/aziontech/lib/commit/937195061a99bfe2efd59b5fb4bd858fb27dfb8f))

### [1.17.2-stage.1](https://github.com/aziontech/lib/compare/v1.17.1...v1.17.2-stage.1) (2025-03-24)


### Bug Fixes

* add Babel presets for TypeScript support and remove ts-loader ([9371950](https://github.com/aziontech/lib/commit/937195061a99bfe2efd59b5fb4bd858fb27dfb8f))

### [1.17.1](https://github.com/aziontech/lib/compare/v1.17.0...v1.17.1) (2025-03-24)


### Bug Fixes

* enhance webpack bundler with Babel custom loader and update dependencies (#140) ([dcc481e](https://github.com/aziontech/lib/commit/dcc481ef499e786725317ccf70acea138574eaee))

### [1.17.1-stage.1](https://github.com/aziontech/lib/compare/v1.17.0...v1.17.1-stage.1) (2025-03-24)


### Bug Fixes

* enhance webpack bundler with Babel custom loader and update dependencies (#140) ([dcc481e](https://github.com/aziontech/lib/commit/dcc481ef499e786725317ccf70acea138574eaee))

## [1.17.0](https://github.com/aziontech/lib/compare/v1.16.0...v1.17.0) (2025-03-21)


### Features

* new bundler package, presets package adjustments and utils package (#130) ([0723e36](https://github.com/aziontech/lib/commit/0723e36a97a773ac70b79be5108eab95521b9155))


### Bug Fixes

* add fast-glob dependency (#137) ([c3a158b](https://github.com/aziontech/lib/commit/c3a158b5d150ff98048840a5d2be932ef306331a))
* add preset files and adjustments (#134) ([8542e5c](https://github.com/aziontech/lib/commit/8542e5cb77eeb8b9a914083b3a87bfe6c2d9336f))
* adding dependencies to root (#132) ([088918e](https://github.com/aziontech/lib/commit/088918e24055bd35a29252407d675cae5c4ac9c2))
* handle npx case for edge-functions in getAbsoluteDirPath (#133) ([8ec573d](https://github.com/aziontech/lib/commit/8ec573de3ffd0c53a885b20d1d0c9cb30ef5123f))
* update @edge-runtime/primitives dependency to version 3.1.1 (#136) ([5be60f4](https://github.com/aziontech/lib/commit/5be60f434da91684ee992a3677d566688cb00a5f))

## [1.17.0-stage.6](https://github.com/aziontech/lib/compare/v1.17.0-stage.5...v1.17.0-stage.6) (2025-03-19)


### Bug Fixes

* add fast-glob dependency (#137) ([c3a158b](https://github.com/aziontech/lib/commit/c3a158b5d150ff98048840a5d2be932ef306331a))

## [1.17.0-stage.5](https://github.com/aziontech/lib/compare/v1.17.0-stage.4...v1.17.0-stage.5) (2025-03-19)


### Bug Fixes

* update @edge-runtime/primitives dependency to version 3.1.1 (#136) ([5be60f4](https://github.com/aziontech/lib/commit/5be60f434da91684ee992a3677d566688cb00a5f))

## [1.17.0-stage.4](https://github.com/aziontech/lib/compare/v1.17.0-stage.3...v1.17.0-stage.4) (2025-03-18)


### Bug Fixes

* add preset files and adjustments (#134) ([8542e5c](https://github.com/aziontech/lib/commit/8542e5cb77eeb8b9a914083b3a87bfe6c2d9336f))

## [1.17.0-stage.3](https://github.com/aziontech/lib/compare/v1.17.0-stage.2...v1.17.0-stage.3) (2025-03-14)


### Bug Fixes

* handle npx case for edge-functions in getAbsoluteDirPath (#133) ([8ec573d](https://github.com/aziontech/lib/commit/8ec573de3ffd0c53a885b20d1d0c9cb30ef5123f))

## [1.17.0-stage.2](https://github.com/aziontech/lib/compare/v1.17.0-stage.1...v1.17.0-stage.2) (2025-03-14)


### Bug Fixes

* adding dependencies to root (#132) ([088918e](https://github.com/aziontech/lib/commit/088918e24055bd35a29252407d675cae5c4ac9c2))

## [1.17.0-stage.1](https://github.com/aziontech/lib/compare/v1.16.0...v1.17.0-stage.1) (2025-03-13)


### Features

* new bundler package, presets package adjustments and utils package (#130) ([0723e36](https://github.com/aziontech/lib/commit/0723e36a97a773ac70b79be5108eab95521b9155))

## [1.16.0](https://github.com/aziontech/lib/compare/v1.15.0...v1.16.0) (2025-03-10)


### Features

* new preset for preact ssg ([fa9acf2](https://github.com/aziontech/lib/commit/fa9acf24d9c3f4075d911b32ec109ece113f86df))
* **sql:** browser support ([ba9b688](https://github.com/aziontech/lib/commit/ba9b688dbf55412b9295cec66554b3c8c528c0db))
* **sql:** force api rest ([e324bd6](https://github.com/aziontech/lib/commit/e324bd6030349c4a141745d6ec2aa79066808415))
* **storage:** force api rest ([800ef81](https://github.com/aziontech/lib/commit/800ef818dd163917b68dc43314934b22a9acc4ac))


### Bug Fixes

* enhance error handling in SQL queries and add utility for error checking (#124) ([f57fb55](https://github.com/aziontech/lib/commit/f57fb5580e927d268186eb72bf29f6ed4a7016b2))
* preact config name ([facd7b5](https://github.com/aziontech/lib/commit/facd7b543a01df9fe96fe93b95011b61eceaa9f9))

## [1.16.0-stage.4](https://github.com/aziontech/lib/compare/v1.16.0-stage.3...v1.16.0-stage.4) (2025-02-27)


### Bug Fixes

* enhance error handling in SQL queries and add utility for error checking (#124) ([f57fb55](https://github.com/aziontech/lib/commit/f57fb5580e927d268186eb72bf29f6ed4a7016b2))

## [1.16.0-stage.3](https://github.com/aziontech/lib/compare/v1.16.0-stage.2...v1.16.0-stage.3) (2025-02-27)


### Features

* **sql:** browser support ([ba9b688](https://github.com/aziontech/lib/commit/ba9b688dbf55412b9295cec66554b3c8c528c0db))
* **sql:** force api rest ([e324bd6](https://github.com/aziontech/lib/commit/e324bd6030349c4a141745d6ec2aa79066808415))
* **storage:** force api rest ([800ef81](https://github.com/aziontech/lib/commit/800ef818dd163917b68dc43314934b22a9acc4ac))

## [1.16.0-stage.2](https://github.com/aziontech/lib/compare/v1.16.0-stage.1...v1.16.0-stage.2) (2025-02-11)


### Bug Fixes

* preact config name ([facd7b5](https://github.com/aziontech/lib/commit/facd7b543a01df9fe96fe93b95011b61eceaa9f9))

## [1.16.0-stage.1](https://github.com/aziontech/lib/compare/v1.15.0...v1.16.0-stage.1) (2025-02-10)


### Features

* new preset for preact ssg ([fa9acf2](https://github.com/aziontech/lib/commit/fa9acf24d9c3f4075d911b32ec109ece113f86df))

## [1.15.0](https://github.com/aziontech/lib/compare/v1.14.2...v1.15.0) (2025-02-10)


### Features

* new preset for preact ssg ([1769277](https://github.com/aziontech/lib/commit/1769277053bf6d8c1acd6780fdb08929662cac07))

### [1.14.2](https://github.com/aziontech/lib/compare/v1.14.1...v1.14.2) (2025-02-07)


### Bug Fixes

* update schemas and return empty config (#103) ([40d0bce](https://github.com/aziontech/lib/commit/40d0bcecb7b42cd4a3f75bb36047c429ea630783))

### [1.14.2-stage.1](https://github.com/aziontech/lib/compare/v1.14.1...v1.14.2-stage.1) (2025-02-07)


### Bug Fixes

* update schemas and return empty config (#103) ([40d0bce](https://github.com/aziontech/lib/commit/40d0bcecb7b42cd4a3f75bb36047c429ea630783))

### [1.14.1](https://github.com/aziontech/lib/compare/v1.14.0...v1.14.1) (2025-02-06)


### Bug Fixes

* adjustments in the domain and firewall processing transform config (#101) ([a455143](https://github.com/aziontech/lib/commit/a455143bf0bc5836ad7de65d67a6fab7c0f4fe7b))

### [1.14.1-stage.1](https://github.com/aziontech/lib/compare/v1.14.0...v1.14.1-stage.1) (2025-02-06)


### Bug Fixes

* adjustments in the domain and firewall processing transform config (#101) ([a455143](https://github.com/aziontech/lib/commit/a455143bf0bc5836ad7de65d67a6fab7c0f4fe7b))

## [1.14.0](https://github.com/aziontech/lib/compare/v1.13.1...v1.14.0) (2025-02-05)


### Features

* add temporary polyfills for performance and navigator in unenv-preset (#99) ([919bdf4](https://github.com/aziontech/lib/commit/919bdf42cdd36f00e4e7357129523d472e28a38e))
* create unenv-preset package (#96) ([ddcf7fc](https://github.com/aziontech/lib/commit/ddcf7fc4e0138c814597e8bf37bdcc220bafe054))


### Bug Fixes

* add crypto-browserify as a dependency (#97) ([f6b146f](https://github.com/aziontech/lib/commit/f6b146f6df56710705017558fc06ee2e0a0042a3))
* export polyfills path for unenv-preset package (#98) ([8df8a7a](https://github.com/aziontech/lib/commit/8df8a7a44f7471b2de3ea18898fec433fbf8d59f))

## [1.14.0-stage.4](https://github.com/aziontech/lib/compare/v1.14.0-stage.3...v1.14.0-stage.4) (2025-02-04)


### Features

* add temporary polyfills for performance and navigator in unenv-preset (#99) ([919bdf4](https://github.com/aziontech/lib/commit/919bdf42cdd36f00e4e7357129523d472e28a38e))

## [1.14.0-stage.3](https://github.com/aziontech/lib/compare/v1.14.0-stage.2...v1.14.0-stage.3) (2025-02-03)


### Bug Fixes

* export polyfills path for unenv-preset package (#98) ([8df8a7a](https://github.com/aziontech/lib/commit/8df8a7a44f7471b2de3ea18898fec433fbf8d59f))

## [1.14.0-stage.2](https://github.com/aziontech/lib/compare/v1.14.0-stage.1...v1.14.0-stage.2) (2025-02-03)


### Bug Fixes

* add crypto-browserify as a dependency (#97) ([f6b146f](https://github.com/aziontech/lib/commit/f6b146f6df56710705017558fc06ee2e0a0042a3))

## [1.14.0-stage.1](https://github.com/aziontech/lib/compare/v1.13.1...v1.14.0-stage.1) (2025-02-03)


### Features

* create unenv-preset package (#96) ([ddcf7fc](https://github.com/aziontech/lib/commit/ddcf7fc4e0138c814597e8bf37bdcc220bafe054))

### [1.13.1](https://github.com/aziontech/lib/compare/v1.13.0...v1.13.1) (2025-01-30)


### Bug Fixes

* **manifest:** set response cookie ([ddb98a0](https://github.com/aziontech/lib/commit/ddb98a0b9ebc283f88d1e34044b62f85af907770))

### [1.13.1-stage.1](https://github.com/aziontech/lib/compare/v1.13.0...v1.13.1-stage.1) (2025-01-30)


### Bug Fixes

* **manifest:** set response cookie ([ddb98a0](https://github.com/aziontech/lib/commit/ddb98a0b9ebc283f88d1e34044b62f85af907770))

## [1.13.0](https://github.com/aziontech/lib/compare/v1.12.1...v1.13.0) (2025-01-30)


### Features

* add preset qwik ([cd77b0f](https://github.com/aziontech/lib/commit/cd77b0fa83de2021236199ed744ab2cac21e6a1d))


### Bug Fixes

* sdk search params (#92) ([3d36aa0](https://github.com/aziontech/lib/commit/3d36aa03f8cfbd00c9e6b3647e66ccd6dd4ce7a0))

## [1.13.0-stage.2](https://github.com/aziontech/lib/compare/v1.13.0-stage.1...v1.13.0-stage.2) (2025-01-30)


### Bug Fixes

* sdk search params (#92) ([3d36aa0](https://github.com/aziontech/lib/commit/3d36aa03f8cfbd00c9e6b3647e66ccd6dd4ce7a0))

## [1.13.0-stage.1](https://github.com/aziontech/lib/compare/v1.12.1...v1.13.0-stage.1) (2025-01-24)


### Features

* add preset qwik ([cd77b0f](https://github.com/aziontech/lib/commit/cd77b0fa83de2021236199ed744ab2cac21e6a1d))

### [1.12.1](https://github.com/aziontech/lib/compare/v1.12.0...v1.12.1) (2025-01-21)


### Bug Fixes

* criteria variables validation (#89) ([2a11fef](https://github.com/aziontech/lib/commit/2a11fefee92bfe8312f67a4335ed1cb39a1a3dad))

### [1.12.1-stage.1](https://github.com/aziontech/lib/compare/v1.12.0...v1.12.1-stage.1) (2025-01-21)


### Bug Fixes

* criteria variables validation (#89) ([2a11fef](https://github.com/aziontech/lib/commit/2a11fefee92bfe8312f67a4335ed1cb39a1a3dad))

## [1.12.0](https://github.com/aziontech/lib/compare/v1.11.1...v1.12.0) (2025-01-20)


### Features

*  firewall, domains and applications manifest schema (#84) ([29394b5](https://github.com/aziontech/lib/commit/29394b5c6be234ea37e6589078fca100b9d1c952))
* add AzionNetworkList type ([8c5bc32](https://github.com/aziontech/lib/commit/8c5bc32b5e8b193ec4d3bb06102b6e3de507b6b4))
* add network list types and implement processing strategy ([bae3a58](https://github.com/aziontech/lib/commit/bae3a58dcdb7acec2d08aead75fae4b5539a408e))
* add new behaviors and schema fields to rules engine (iac) (#88) ([c0755c5](https://github.com/aziontech/lib/commit/c0755c5a79c759d40642f1c2e1dc3a1715dafff5))
* add WAF configuration options and schema validation ([bbe8383](https://github.com/aziontech/lib/commit/bbe8383ba903d0442e9baf6fcd1b4bd96e621ce6))
* add WAF configuration type and properties to AzionConfig ([6e5ea54](https://github.com/aziontech/lib/commit/6e5ea54010273833ee676f6c0eac429d075d7839))
* all rules engine vars ([7b5a09d](https://github.com/aziontech/lib/commit/7b5a09d8ae305a9c438ff23c049302064a2d11f8))
* azion.config 'criteria' prop ([3739d04](https://github.com/aziontech/lib/commit/3739d04531ab2363392c010c1f7caf89d92404b6))
* firewall schema ([e5c5ce9](https://github.com/aziontech/lib/commit/e5c5ce90668d3b74c52f860cca54ec70cda8a841))
* firewall types ([620589b](https://github.com/aziontech/lib/commit/620589b6342503e9face5f20cf1f00114740fc88))
* implement WAF configuration processing ([c730fe0](https://github.com/aziontech/lib/commit/c730fe05c995a942e45252e4e2164dfec264c4f3))
* storage client env option ([ef5234b](https://github.com/aziontech/lib/commit/ef5234b0a155b2695b65275f2462ca01e3c33f37))
* update azion.config.example.ts and schema to include networkList ([049819f](https://github.com/aziontech/lib/commit/049819fd5034c7392a62842f15240ac648b38a7a))


### Bug Fixes

* ensure multiple headers are preserved in manifest conversion (#87) ([66b648f](https://github.com/aziontech/lib/commit/66b648fa8fa0d4aff46cc39a60d443870d2eef3b))
* firewall types ([3ee0d51](https://github.com/aziontech/lib/commit/3ee0d5132d34ca692a5f0e15a4f5bb551aa29f80))
* improve error handling for API responses ([c524637](https://github.com/aziontech/lib/commit/c5246378a2c8c84d6d8113fdb51d5032a8bac7a3))
* variable field validation ([8332053](https://github.com/aziontech/lib/commit/83320534d0deba01b7db3ebcae976f0a5cff1b9a))

## [1.12.0-stage.4](https://github.com/aziontech/lib/compare/v1.12.0-stage.3...v1.12.0-stage.4) (2025-01-17)


### Features

* add new behaviors and schema fields to rules engine (iac) (#88) ([c0755c5](https://github.com/aziontech/lib/commit/c0755c5a79c759d40642f1c2e1dc3a1715dafff5))

## [1.12.0-stage.3](https://github.com/aziontech/lib/compare/v1.12.0-stage.2...v1.12.0-stage.3) (2025-01-13)


### Bug Fixes

* ensure multiple headers are preserved in manifest conversion (#87) ([66b648f](https://github.com/aziontech/lib/commit/66b648fa8fa0d4aff46cc39a60d443870d2eef3b))

## [1.12.0-stage.2](https://github.com/aziontech/lib/compare/v1.12.0-stage.1...v1.12.0-stage.2) (2025-01-07)


### Features

*  firewall, domains and applications manifest schema (#84) ([29394b5](https://github.com/aziontech/lib/commit/29394b5c6be234ea37e6589078fca100b9d1c952))
* add AzionNetworkList type ([8c5bc32](https://github.com/aziontech/lib/commit/8c5bc32b5e8b193ec4d3bb06102b6e3de507b6b4))
* add network list types and implement processing strategy ([bae3a58](https://github.com/aziontech/lib/commit/bae3a58dcdb7acec2d08aead75fae4b5539a408e))
* add WAF configuration options and schema validation ([bbe8383](https://github.com/aziontech/lib/commit/bbe8383ba903d0442e9baf6fcd1b4bd96e621ce6))
* add WAF configuration type and properties to AzionConfig ([6e5ea54](https://github.com/aziontech/lib/commit/6e5ea54010273833ee676f6c0eac429d075d7839))
* all rules engine vars ([7b5a09d](https://github.com/aziontech/lib/commit/7b5a09d8ae305a9c438ff23c049302064a2d11f8))
* firewall schema ([e5c5ce9](https://github.com/aziontech/lib/commit/e5c5ce90668d3b74c52f860cca54ec70cda8a841))
* firewall types ([620589b](https://github.com/aziontech/lib/commit/620589b6342503e9face5f20cf1f00114740fc88))
* implement WAF configuration processing ([c730fe0](https://github.com/aziontech/lib/commit/c730fe05c995a942e45252e4e2164dfec264c4f3))
* storage client env option ([ef5234b](https://github.com/aziontech/lib/commit/ef5234b0a155b2695b65275f2462ca01e3c33f37))
* update azion.config.example.ts and schema to include networkList ([049819f](https://github.com/aziontech/lib/commit/049819fd5034c7392a62842f15240ac648b38a7a))


### Bug Fixes

* firewall types ([3ee0d51](https://github.com/aziontech/lib/commit/3ee0d5132d34ca692a5f0e15a4f5bb551aa29f80))
* improve error handling for API responses ([c524637](https://github.com/aziontech/lib/commit/c5246378a2c8c84d6d8113fdb51d5032a8bac7a3))
* variable field validation ([8332053](https://github.com/aziontech/lib/commit/83320534d0deba01b7db3ebcae976f0a5cff1b9a))

## [1.12.0-stage.1](https://github.com/aziontech/lib/compare/v1.11.1...v1.12.0-stage.1) (2024-11-25)


### Features

* azion.config 'criteria' prop ([3739d04](https://github.com/aziontech/lib/commit/3739d04531ab2363392c010c1f7caf89d92404b6))

### [1.11.1](https://github.com/aziontech/lib/compare/v1.11.0...v1.11.1) (2024-11-14)


### Bug Fixes

* resolve mathjs runtime configuration conflict ([0ece55e](https://github.com/aziontech/lib/commit/0ece55ed3db9ad191568be8bf87f05e1c1ca3293))

### [1.11.1-stage.1](https://github.com/aziontech/lib/compare/v1.11.0...v1.11.1-stage.1) (2024-11-14)


### Bug Fixes

* resolve mathjs runtime configuration conflict ([0ece55e](https://github.com/aziontech/lib/commit/0ece55ed3db9ad191568be8bf87f05e1c1ca3293))

## [1.11.0](https://github.com/aziontech/lib/compare/v1.10.0...v1.11.0) (2024-11-07)


### Features

* add automatic cli latest version detection ([5442afc](https://github.com/aziontech/lib/commit/5442afc2cd84796a53049ca61e675b3d0943de3c))
* update cli version ([d1f7832](https://github.com/aziontech/lib/commit/d1f78326ae2b92d0f86a7811db276e5f965383be))


### Bug Fixes

* typo ([41bbca1](https://github.com/aziontech/lib/commit/41bbca1e0cfa393951c272604210accb0b37db1d))

## [1.11.0-stage.1](https://github.com/aziontech/lib/compare/v1.10.0...v1.11.0-stage.1) (2024-11-07)


### Features

* add automatic cli latest version detection ([5442afc](https://github.com/aziontech/lib/commit/5442afc2cd84796a53049ca61e675b3d0943de3c))
* update cli version ([d1f7832](https://github.com/aziontech/lib/commit/d1f78326ae2b92d0f86a7811db276e5f965383be))


### Bug Fixes

* typo ([41bbca1](https://github.com/aziontech/lib/commit/41bbca1e0cfa393951c272604210accb0b37db1d))

## [1.10.0](https://github.com/aziontech/lib/compare/v1.9.0...v1.10.0) (2024-11-06)


### Features

* presets ([71d9835](https://github.com/aziontech/lib/commit/71d983587e49295829406c1654600ac054c3d46b))

## [1.10.0-stage.1](https://github.com/aziontech/lib/compare/v1.9.0...v1.10.0-stage.1) (2024-11-06)


### Features

* presets ([71d9835](https://github.com/aziontech/lib/commit/71d983587e49295829406c1654600ac054c3d46b))

## [1.9.0](https://github.com/aziontech/lib/compare/v1.8.2...v1.9.0) (2024-10-28)


### Features

* azion/ai (#58) ([f873a00](https://github.com/aziontech/lib/commit/f873a00becc4e174a9457e29087509eafdb68992))
* improve fetch error handling (#57) ([bb901e5](https://github.com/aziontech/lib/commit/bb901e5d039beab758a5f0652255c9e96ac51437))


### Bug Fixes

* azion/ai exports ([81c636e](https://github.com/aziontech/lib/commit/81c636eda6be676db07f738c9117e7aee0659d93))

## [1.9.0-stage.3](https://github.com/aziontech/lib/compare/v1.9.0-stage.2...v1.9.0-stage.3) (2024-10-21)


### Bug Fixes

* azion/ai exports ([81c636e](https://github.com/aziontech/lib/commit/81c636eda6be676db07f738c9117e7aee0659d93))

## [1.9.0-stage.2](https://github.com/aziontech/lib/compare/v1.9.0-stage.1...v1.9.0-stage.2) (2024-10-19)


### Features

* azion/ai (#58) ([f873a00](https://github.com/aziontech/lib/commit/f873a00becc4e174a9457e29087509eafdb68992))

## [1.9.0-stage.1](https://github.com/aziontech/lib/compare/v1.8.2...v1.9.0-stage.1) (2024-10-16)


### Features

* improve fetch error handling (#57) ([bb901e5](https://github.com/aziontech/lib/commit/bb901e5d039beab758a5f0652255c9e96ac51437))

### [1.8.2](https://github.com/aziontech/lib/compare/v1.8.1...v1.8.2) (2024-10-03)


### Bug Fixes

* change CLI bin in release workflow (#55) ([6f3ad79](https://github.com/aziontech/lib/commit/6f3ad79fdb4a144c8863276dd15fcf7436371358))

### [1.8.2-stage.1](https://github.com/aziontech/lib/compare/v1.8.1...v1.8.2-stage.1) (2024-10-03)


### Bug Fixes

* change CLI bin in release workflow (#55) ([6f3ad79](https://github.com/aziontech/lib/commit/6f3ad79fdb4a144c8863276dd15fcf7436371358))

### [1.8.1](https://github.com/aziontech/lib/compare/v1.8.0...v1.8.1) (2024-10-03)


### Bug Fixes

* returning error in useExecute (#53) ([243cb29](https://github.com/aziontech/lib/commit/243cb297236df16c10de9dac8360efe6f3060f70))

### [1.8.1-stage.1](https://github.com/aziontech/lib/compare/v1.8.0...v1.8.1-stage.1) (2024-10-03)


### Bug Fixes

* returning error in useExecute (#53) ([243cb29](https://github.com/aziontech/lib/commit/243cb297236df16c10de9dac8360efe6f3060f70))

## [1.8.0](https://github.com/aziontech/lib/compare/v1.7.0...v1.8.0) (2024-09-30)


### Features

* add convert json config to config object (#44) ([1b09352](https://github.com/aziontech/lib/commit/1b093526d76c8ae473f76991b62cb71fe1f5f11c))
* new azion cli version (#47) ([191dd9c](https://github.com/aziontech/lib/commit/191dd9ca4b991969e2b142a9e7bfd9ffc4da05d1))


### Bug Fixes

* adding cli script dependency (#50) ([a0f8e31](https://github.com/aziontech/lib/commit/a0f8e31d601793b1785bf044125d3e98e0b0bb9c))
* bin install ([f801f3c](https://github.com/aziontech/lib/commit/f801f3cac98ca5aa2d950a6eb0d5f905b13b1423))
* cli bin conflicts (#45) ([daabc33](https://github.com/aziontech/lib/commit/daabc33db63e41f65088d19ce320f3ab531bd3ea))
* handle download and extraction errors gracefully (#49) ([1aab72e](https://github.com/aziontech/lib/commit/1aab72e2ec04ed46081ab5b171bf81dd8501b76a))
* improve configuration validation (#48) ([d7ee13e](https://github.com/aziontech/lib/commit/d7ee13e0f124821e2af58b3e4d44ba5ccf932442))
* remove logs bin install ([754df4b](https://github.com/aziontech/lib/commit/754df4ba47cab262fb1a30c5f70cbc074cd6b3f4))
* revert changes to bin install script ([80be55f](https://github.com/aziontech/lib/commit/80be55f695dbf17e61f85e9344772aa961f12bb3))

## [1.8.0-stage.7](https://github.com/aziontech/lib/compare/v1.8.0-stage.6...v1.8.0-stage.7) (2024-09-27)


### Bug Fixes

* adding cli script dependency (#50) ([a0f8e31](https://github.com/aziontech/lib/commit/a0f8e31d601793b1785bf044125d3e98e0b0bb9c))

## [1.8.0-stage.6](https://github.com/aziontech/lib/compare/v1.8.0-stage.5...v1.8.0-stage.6) (2024-09-26)


### Features

* new azion cli version (#47) ([191dd9c](https://github.com/aziontech/lib/commit/191dd9ca4b991969e2b142a9e7bfd9ffc4da05d1))


### Bug Fixes

* handle download and extraction errors gracefully (#49) ([1aab72e](https://github.com/aziontech/lib/commit/1aab72e2ec04ed46081ab5b171bf81dd8501b76a))
* improve configuration validation (#48) ([d7ee13e](https://github.com/aziontech/lib/commit/d7ee13e0f124821e2af58b3e4d44ba5ccf932442))

## [1.8.0-stage.5](https://github.com/aziontech/lib/compare/v1.8.0-stage.4...v1.8.0-stage.5) (2024-09-26)


### Bug Fixes

* bin install ([f801f3c](https://github.com/aziontech/lib/commit/f801f3cac98ca5aa2d950a6eb0d5f905b13b1423))

## [1.8.0-stage.4](https://github.com/aziontech/lib/compare/v1.8.0-stage.3...v1.8.0-stage.4) (2024-09-26)


### Bug Fixes

* revert changes to bin install script ([80be55f](https://github.com/aziontech/lib/commit/80be55f695dbf17e61f85e9344772aa961f12bb3))

## [1.8.0-stage.3](https://github.com/aziontech/lib/compare/v1.8.0-stage.2...v1.8.0-stage.3) (2024-09-26)


### Bug Fixes

* remove logs bin install ([754df4b](https://github.com/aziontech/lib/commit/754df4ba47cab262fb1a30c5f70cbc074cd6b3f4))

## [1.8.0-stage.2](https://github.com/aziontech/lib/compare/v1.8.0-stage.1...v1.8.0-stage.2) (2024-09-26)


### Bug Fixes

* cli bin conflicts (#45) ([daabc33](https://github.com/aziontech/lib/commit/daabc33db63e41f65088d19ce320f3ab531bd3ea))

## [1.8.0-stage.1](https://github.com/aziontech/lib/compare/v1.7.0...v1.8.0-stage.1) (2024-09-26)


### Features

* add convert json config to config object (#44) ([1b09352](https://github.com/aziontech/lib/commit/1b093526d76c8ae473f76991b62cb71fe1f5f11c))

## [1.7.0](https://github.com/aziontech/lib/compare/v1.6.0...v1.7.0) (2024-09-17)


### Features

* add package application (#37) ([e53c5b0](https://github.com/aziontech/lib/commit/e53c5b0908233484d976c2bb25df921bb9588b87))
* add package domains (#38) ([9a020c1](https://github.com/aziontech/lib/commit/9a020c14907f65009da97dc507fe901017452fe6))
* azion cli binary  (#32) ([0670adb](https://github.com/aziontech/lib/commit/0670adb9b4f9086126a8f5387f95e001da3a748b))
* enable azion stage ([6588e63](https://github.com/aziontech/lib/commit/6588e63ba7fa9f60f0570316ae501a1d21e1fe40))
* jsdoc for azion client ([a4a2bd3](https://github.com/aziontech/lib/commit/a4a2bd39a2e01184aaf0bbf320c194d2364853e6))
* process config in azion/config (#41) ([9a6afc0](https://github.com/aziontech/lib/commit/9a6afc0233f356e0a20f60bcf39ed03347689fea))
* updating function returns (#36) ([088bbd3](https://github.com/aziontech/lib/commit/088bbd359a9f33de73352a35db59601dee053285))


### Bug Fixes

* bin path (again) ([b43676a](https://github.com/aziontech/lib/commit/b43676a324df9f3d470dacabd395450be79144d9))
* cli bin path (#33) ([f1aee5e](https://github.com/aziontech/lib/commit/f1aee5e30f0eab8e9f5209c730439af81779309b))
* cli relative path (#34) ([c6b5fb4](https://github.com/aziontech/lib/commit/c6b5fb4214c012780ba8315acad78d5202eed1df))
* npm bin path ([3833208](https://github.com/aziontech/lib/commit/3833208bfd127509616f40aa1177f95a8ec7ff1b))
* npm bin path (#35) ([ea5bb4f](https://github.com/aziontech/lib/commit/ea5bb4f8f6a1cd9d30945d06fdb5357183c3bbf2))
* storage endpoint ([dd3e140](https://github.com/aziontech/lib/commit/dd3e14023735133b5ead3fba89d1f636233d736b))
* storage params ([c995bbb](https://github.com/aziontech/lib/commit/c995bbbd8168cc9138370baf9849e20267e067a9))

## [1.7.0-stage.12](https://github.com/aziontech/lib/compare/v1.7.0-stage.11...v1.7.0-stage.12) (2024-09-17)


### Features

* process config in azion/config (#41) ([9a6afc0](https://github.com/aziontech/lib/commit/9a6afc0233f356e0a20f60bcf39ed03347689fea))

## [1.7.0-stage.11](https://github.com/aziontech/lib/compare/v1.7.0-stage.10...v1.7.0-stage.11) (2024-09-10)


### Features

* add package domains (#38) ([9a020c1](https://github.com/aziontech/lib/commit/9a020c14907f65009da97dc507fe901017452fe6))

## [1.7.0-stage.10](https://github.com/aziontech/lib/compare/v1.7.0-stage.9...v1.7.0-stage.10) (2024-09-09)


### Features

* add package application (#37) ([e53c5b0](https://github.com/aziontech/lib/commit/e53c5b0908233484d976c2bb25df921bb9588b87))

## [1.7.0-stage.9](https://github.com/aziontech/lib/compare/v1.7.0-stage.8...v1.7.0-stage.9) (2024-09-05)


### Features

* updating function returns (#36) ([088bbd3](https://github.com/aziontech/lib/commit/088bbd359a9f33de73352a35db59601dee053285))

## [1.7.0-stage.8](https://github.com/aziontech/lib/compare/v1.7.0-stage.7...v1.7.0-stage.8) (2024-09-03)


### Bug Fixes

* storage endpoint ([dd3e140](https://github.com/aziontech/lib/commit/dd3e14023735133b5ead3fba89d1f636233d736b))
* storage params ([c995bbb](https://github.com/aziontech/lib/commit/c995bbbd8168cc9138370baf9849e20267e067a9))

## [1.7.0-stage.7](https://github.com/aziontech/lib/compare/v1.7.0-stage.6...v1.7.0-stage.7) (2024-09-03)


### Features

* enable azion stage ([6588e63](https://github.com/aziontech/lib/commit/6588e63ba7fa9f60f0570316ae501a1d21e1fe40))

## [1.7.0-stage.6](https://github.com/aziontech/lib/compare/v1.7.0-stage.5...v1.7.0-stage.6) (2024-09-03)


### Bug Fixes

* bin path (again) ([b43676a](https://github.com/aziontech/lib/commit/b43676a324df9f3d470dacabd395450be79144d9))
* npm bin path ([3833208](https://github.com/aziontech/lib/commit/3833208bfd127509616f40aa1177f95a8ec7ff1b))

## [1.7.0-stage.5](https://github.com/aziontech/lib/compare/v1.7.0-stage.4...v1.7.0-stage.5) (2024-09-03)


### Bug Fixes

* npm bin path (#35) ([ea5bb4f](https://github.com/aziontech/lib/commit/ea5bb4f8f6a1cd9d30945d06fdb5357183c3bbf2))

## [1.7.0-stage.4](https://github.com/aziontech/lib/compare/v1.7.0-stage.3...v1.7.0-stage.4) (2024-09-03)


### Bug Fixes

* cli relative path (#34) ([c6b5fb4](https://github.com/aziontech/lib/commit/c6b5fb4214c012780ba8315acad78d5202eed1df))

## [1.7.0-stage.3](https://github.com/aziontech/lib/compare/v1.7.0-stage.2...v1.7.0-stage.3) (2024-09-03)


### Bug Fixes

* cli bin path (#33) ([f1aee5e](https://github.com/aziontech/lib/commit/f1aee5e30f0eab8e9f5209c730439af81779309b))

## [1.7.0-stage.2](https://github.com/aziontech/lib/compare/v1.7.0-stage.1...v1.7.0-stage.2) (2024-09-03)


### Features

* azion cli binary  (#32) ([0670adb](https://github.com/aziontech/lib/commit/0670adb9b4f9086126a8f5387f95e001da3a748b))

## [1.7.0-stage.1](https://github.com/aziontech/lib/compare/v1.6.0...v1.7.0-stage.1) (2024-08-30)


### Features

* jsdoc for azion client ([a4a2bd3](https://github.com/aziontech/lib/commit/a4a2bd39a2e01184aaf0bbf320c194d2364853e6))

## [1.6.0](https://github.com/aziontech/lib/compare/v1.5.0...v1.6.0) (2024-08-28)


### Features

* add listTables method to sql package (#28) ([9bd7366](https://github.com/aziontech/lib/commit/9bd73665598400f1c062de353a6b8a8682f02021))
* azion runtime internal sql and storage (#24) ([a4311aa](https://github.com/aziontech/lib/commit/a4311aab8ddd0cd3ee80cfcb5c37e534a2185ce9))
* max_object_count param ([2185a67](https://github.com/aziontech/lib/commit/2185a670c65ca987fb11be5f5c402837305fabfa))


### Bug Fixes

* remove  (getObjects list) ([bde5ee4](https://github.com/aziontech/lib/commit/bde5ee46117d69ed467b895e5a50084a2b9023f2))
* standardize key return ([5243f37](https://github.com/aziontech/lib/commit/5243f37d465f20816275f9467a796972a1820f13))

## [1.6.0-stage.3](https://github.com/aziontech/lib/compare/v1.6.0-stage.2...v1.6.0-stage.3) (2024-08-27)


### Features

* add listTables method to sql package (#28) ([9bd7366](https://github.com/aziontech/lib/commit/9bd73665598400f1c062de353a6b8a8682f02021))

## [1.6.0-stage.2](https://github.com/aziontech/lib/compare/v1.6.0-stage.1...v1.6.0-stage.2) (2024-08-27)


### Features

* max_object_count param ([2185a67](https://github.com/aziontech/lib/commit/2185a670c65ca987fb11be5f5c402837305fabfa))


### Bug Fixes

* remove  (getObjects list) ([bde5ee4](https://github.com/aziontech/lib/commit/bde5ee46117d69ed467b895e5a50084a2b9023f2))
* standardize key return ([5243f37](https://github.com/aziontech/lib/commit/5243f37d465f20816275f9467a796972a1820f13))

## [1.6.0-stage.1](https://github.com/aziontech/lib/compare/v1.5.0...v1.6.0-stage.1) (2024-08-21)


### Features

* azion runtime internal sql and storage (#24) ([a4311aa](https://github.com/aziontech/lib/commit/a4311aab8ddd0cd3ee80cfcb5c37e534a2185ce9))

## [1.5.0](https://github.com/aziontech/lib/compare/v1.4.0...v1.5.0) (2024-08-16)


### Features

* adding domain, origin and purge types in AzionConfig (#18) ([679d836](https://github.com/aziontech/lib/commit/679d8368d23dfd0ace5fc7832b9c37cf36fe0b4b))
* defineConfig() and export types (#22) ([ecb3e1e](https://github.com/aziontech/lib/commit/ecb3e1e7e21264f2b6b8ee6ed2e81e42b26dae6b))
* utils and types packages (#21) ([224f569](https://github.com/aziontech/lib/commit/224f5695572439a25e59db84b9a34dbca2a8a255))


### Bug Fixes

* types export (#23) ([6413f52](https://github.com/aziontech/lib/commit/6413f52c889bb1ee1ef999fb544506a3661dba0f))

## [1.5.0-stage.2](https://github.com/aziontech/lib/compare/v1.5.0-stage.1...v1.5.0-stage.2) (2024-08-16)


### Features

* defineConfig() and export types (#22) ([ecb3e1e](https://github.com/aziontech/lib/commit/ecb3e1e7e21264f2b6b8ee6ed2e81e42b26dae6b))
* utils and types packages (#21) ([224f569](https://github.com/aziontech/lib/commit/224f5695572439a25e59db84b9a34dbca2a8a255))


### Bug Fixes

* types export (#23) ([6413f52](https://github.com/aziontech/lib/commit/6413f52c889bb1ee1ef999fb544506a3661dba0f))

## [1.5.0-stage.1](https://github.com/aziontech/lib/compare/v1.4.0...v1.5.0-stage.1) (2024-08-09)


### Features

* adding domain, origin and purge types in AzionConfig (#18) ([679d836](https://github.com/aziontech/lib/commit/679d8368d23dfd0ace5fc7832b9c37cf36fe0b4b))

## [1.4.0](https://github.com/aziontech/lib/compare/v1.3.0...v1.4.0) (2024-07-25)


### Features

* create jwt package (#11) ([b78f30e](https://github.com/aziontech/lib/commit/b78f30eb8def541f0b829bd9f06afacac72a0ab5))

## [1.4.0-stage.1](https://github.com/aziontech/lib/compare/v1.3.0...v1.4.0-stage.1) (2024-07-25)


### Features

* create jwt package (#11) ([b78f30e](https://github.com/aziontech/lib/commit/b78f30eb8def541f0b829bd9f06afacac72a0ab5))

## [1.3.0](https://github.com/aziontech/lib/compare/v1.2.0...v1.3.0) (2024-07-18)


### Features

*  release pnpm and yarn access ([f8b8ae9](https://github.com/aziontech/lib/commit/f8b8ae9da3a7da4c3f5ff958a84e64675056059b))

## [1.3.0-stage.1](https://github.com/aziontech/lib/compare/v1.2.0...v1.3.0-stage.1) (2024-07-18)


### Features

*  release pnpm and yarn access ([f8b8ae9](https://github.com/aziontech/lib/commit/f8b8ae9da3a7da4c3f5ff958a84e64675056059b))

## [1.2.0](https://github.com/aziontech/lib/compare/v1.1.0...v1.2.0) (2024-07-18)


### Features

* **config:** azionconfig validator ([7f71be4](https://github.com/aziontech/lib/commit/7f71be43532b48fabb36401710293f10240a9570))
* **cookies:** Implementing package functionalities (#9) ([131dbe4](https://github.com/aziontech/lib/commit/131dbe4781b10970693da1dc22fbb7a28c366e4a))
* edge-sql and edge-storage ([a8f39c6](https://github.com/aziontech/lib/commit/a8f39c687909f4f58c5a4e2ca5045e2c54a656a1))
* examples ([ff352f2](https://github.com/aziontech/lib/commit/ff352f2a588e4d5da0f60ceb9359faa7bd7be66e))
* improve types/interfaces ([383eb3c](https://github.com/aziontech/lib/commit/383eb3c97d62ab5be12acda76e3c7bf6bac27f14))
* purge package ([9c7038b](https://github.com/aziontech/lib/commit/9c7038b8cd8a96d3fb3c62b0f1f7b319c7984ac3))

## [1.2.0-stage.2](https://github.com/aziontech/lib/compare/v1.2.0-stage.1...v1.2.0-stage.2) (2024-07-18)


### Features

* **config:** azionconfig validator ([7f71be4](https://github.com/aziontech/lib/commit/7f71be43532b48fabb36401710293f10240a9570))
* edge-sql and edge-storage ([a8f39c6](https://github.com/aziontech/lib/commit/a8f39c687909f4f58c5a4e2ca5045e2c54a656a1))
* examples ([ff352f2](https://github.com/aziontech/lib/commit/ff352f2a588e4d5da0f60ceb9359faa7bd7be66e))
* improve types/interfaces ([383eb3c](https://github.com/aziontech/lib/commit/383eb3c97d62ab5be12acda76e3c7bf6bac27f14))
* purge package ([9c7038b](https://github.com/aziontech/lib/commit/9c7038b8cd8a96d3fb3c62b0f1f7b319c7984ac3))

## [1.2.0-stage.1](https://github.com/aziontech/lib/compare/v1.1.0...v1.2.0-stage.1) (2024-07-10)


### Features

* **cookies:** Implementing package functionalities (#9) ([131dbe4](https://github.com/aziontech/lib/commit/131dbe4781b10970693da1dc22fbb7a28c366e4a))

## [1.1.0](https://github.com/aziontech/lib/compare/v1.0.0...v1.1.0) (2024-05-03)


### Features

* wasm image processor (#4) ([420b4b5](https://github.com/aziontech/lib/commit/420b4b56657a677650f9053eaecfbec2f8c0c26f))


### Bug Fixes

* update package lock (#5) ([66fbf1e](https://github.com/aziontech/lib/commit/66fbf1e236e2981f63a850e3f5f695fb9da156bf))

## [1.1.0-stage.1](https://github.com/aziontech/lib/compare/v1.0.0...v1.1.0-stage.1) (2024-05-02)


### Features

* wasm image processor (#4) ([420b4b5](https://github.com/aziontech/lib/commit/420b4b56657a677650f9053eaecfbec2f8c0c26f))


### Bug Fixes

* update package lock (#5) ([66fbf1e](https://github.com/aziontech/lib/commit/66fbf1e236e2981f63a850e3f5f695fb9da156bf))

## 1.0.0 (2024-04-04)


### Features

* welcome azion lib (#2) ([b8ca2a3](https://github.com/aziontech/lib/commit/b8ca2a39c2f9bf2d864ea61fc3307f619f8c02d3))
