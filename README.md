
[![License: MIT](https://img.shields.io/npm/l/@dwtechs/winstan-plugin-express-perf.svg?color=brightgreen)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40dwtechs%2Fwinstan-plugin-express-perf.svg)](https://www.npmjs.com/package/@dwtechs/winstan-plugin-express-perf)
[![last version release date](https://img.shields.io/github/release-date/DWTechs/Winstan-plugin-express-perf.js)](https://www.npmjs.com/package/@dwtechs/winstan-plugin-express-perf)
[![minified size](https://img.shields.io/bundlephobia/min/@dwtechs/winstan-plugin-express-perf?color=brightgreen)](https://www.npmjs.com/package/@dwtechs/winstan-plugin-express-perf)

- [Synopsis](#synopsis)
- [Support](#support)
- [Installation](#installation)
- [Usage](#usage)
  - [ES6](#es6)
- [Contributors](#contributors)
- [Stack](#stack)


## Synopsis

**[Winstan-plugin-express-perf.js](https://github.com/DWTechs/Winstan-plugin-express-perf.js)** is an open source Express performance measurement plugin for Winstan library.

**This plugin will log the time it took to process a request.**

- no dependency
- Very lightweight
- Thoroughly tested
- Works in Javascript and Typescript
- Can be used as EcmaScrypt module
- Written in Typescript


## Support

- node: 22

This is the oldest targeted versions. The library should work properly on older versions of Node.js but we do not support it officially.  


## Installation

```bash
$ npm i @dwtechs/winstan-plugin-express-perf
```


## Usage


### ES6 / TypeScript

```javascript

import express from "express";
import perf from '@dwtechs/winstan-plugin-express-perf';

const app = express();
app.use(express.json());
// performance measurement starts for any call to the following routes
app.use(perf.start);
app.use("/", route);
// Performance measurement ends
app.use(perf.end);

```

Note that the plugin is standalone as it installs Winstan as a dependency.
Of course you will usually need Winstan to log other things in you application. 


## Contributors

Winstan-plugin-express-perf.js is still in development and we would be glad to get all the help you can provide.
To contribute please read **[contributor.md](https://github.com/DWTechs/Winstan-plugin-express-perf.js/blob/main/contributor.md)** for detailed installation guide.


## Stack

| Purpose         |                    Choice                    |                                                     Motivation |
| :-------------- | :------------------------------------------: | -------------------------------------------------------------: |
| repository      |        [Github](https://github.com/)         |     hosting for software development version control using Git |
| package manager |     [npm](https://www.npmjs.com/get-npm)     |                                default node.js package manager |
| language        | [TypeScript](https://www.typescriptlang.org) | static type checking along with the latest ECMAScript features |
| module bundler  |      [Rollup](https://rollupjs.org)          |                        advanced module bundler for ES6 modules |
| unit testing    |          [Jest](https://jestjs.io/)          |                  delightful testing with a focus on simplicity |
