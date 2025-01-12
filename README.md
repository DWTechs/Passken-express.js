
[![License: MIT](https://img.shields.io/npm/l/@dwtechs/passken-express.svg?color=brightgreen)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40dwtechs%2Fpassken-express.svg)](https://www.npmjs.com/package/@dwtechs/passken-express)
[![last version release date](https://img.shields.io/github/release-date/DWTechs/Passken-express.js)](https://www.npmjs.com/package/@dwtechs/passken-express)
[![minified size](https://img.shields.io/bundlephobia/min/@dwtechs/passken-express?color=brightgreen)](https://www.npmjs.com/package/@dwtechs/passken-express)

- [Synopsis](#synopsis)
- [Support](#support)
- [Installation](#installation)
- [Usage](#usage)
  - [ES6](#es6)
- [API Reference](#api-reference)
- [Contributors](#contributors)
- [Stack](#stack)


## Synopsis

**[Passken-express.js](https://github.com/DWTechs/Passken-express.js)** is an open source password management library for Express.js.  
It uses @dwtechs/passken and brings Express middlewares for direct use in a node.js service.

**This plugin will log the time it took to process a request.**

- Very lightweight
- Thoroughly tested
- Works in Javascript and Typescript
- Can be used as EcmaScrypt module
- Written in Typescript


## Support

- node: 26

This is the oldest targeted versions. The library should work properly on older versions of Node.js but we do not support it officially.  


## Installation

```bash
$ npm i @dwtechs/winstan-plugin-express-perf
```


## Usage


### ES6 / TypeScript

```javascript

import express from "express";
import pwd from "@dwtechs/passken-express";
import pg from "@internal/pgsql";

import user from "../controllers/user.js";
import mail from "../controllers/mail.js";

const addMany = [
  user.validate,
  pwd.create,
  user.addMany,
  pg.beginTransaction,
  pg.addMany,
  mail.sendRegistration,
  pg.commitTransaction,
];

// Add new users
router.post("/", addMany);

```


## API Reference

### Methods

```javascript

compare(req: Request, res: MyResponse, next: NextFunction): void {}
create(req: Request, res: Response, next: NextFunction): void {}

```


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
