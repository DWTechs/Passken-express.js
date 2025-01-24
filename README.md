
[![License: MIT](https://img.shields.io/npm/l/@dwtechs/passken-express.svg?color=brightgreen)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40dwtechs%2Fpassken-express.svg)](https://www.npmjs.com/package/@dwtechs/passken-express)
[![last version release date](https://img.shields.io/github/release-date/DWTechs/Passken-express.js)](https://www.npmjs.com/package/@dwtechs/passken-express)
[![minified size](https://img.shields.io/bundlephobia/min/@dwtechs/passken-express?color=brightgreen)](https://www.npmjs.com/package/@dwtechs/passken-express)

- [Synopsis](#synopsis)
- [Support](#support)
- [Installation](#installation)
- [Usage](#usage)
  - [ES6](#es6)
  - [Configure](#configure)
  - [Environment variables](#environment-variables)
- [API Reference](#api-reference)
- [options](#options)
- [Logs](#logs)
- [Contributors](#contributors)
- [Stack](#stack)


## Synopsis

**[Passken-express.js](https://github.com/DWTechs/Passken-express.js)** is an open source password management library for Express.js.  
It uses @dwtechs/passken and adds Express middlewares for direct use in a node.js service.

- Very lightweight
- Thoroughly tested
- Works in Javascript and Typescript
- Can be used as CommonJS or EcmaScrypt module
- Written in Typescript


## Support

- node: 16

This is the oldest targeted versions. The library may work properly on older versions of Node.js but we do not support it officially.  


## Installation

```bash
$ npm i @dwtechs/passken-express
```


## Usage


### ES6 / TypeScript

```javascript

import * as pk from "@dwtechs/passken-express";
import express from "express";
const router = express.Router();

import user from "../controllers/user.js";
import mail from "../controllers/mail.js";
import token from "../controllers/token.js";

const passwordOptions = {
  len: 14,
  num: true,
  ucase: false,
  lcase: false,
  sym: false,
  strict: true,
  exclSimilarChars: true,
};
pk.init(passwordOptions);

// middleware sub-stacks

// add users
const addMany = [
  user.validate,
  pk.create,
  user.addMany,
  mail.sendRegistration,
];

// Login user
const login = [
  token.validate,
  user.getPwd,
  pk.compare,
  user.isActive,
];

// Routes

// log a user with his email & password
router.post("/", login);

// Add new users
router.post("/", addMany);

```

### Password Comparison

The method will look for a password value from the client request :  

```Javascript
const pwd = req.body?.password || req.body?.pwd.
```

It will then look for the hashed password stored in the database :

```Javascript
const hash = res.rows[0].password || res.rows[0].pwd || res.password || res.pwd;
```

It will throw an error if the password or the hash are missing.
It will throw an error if the password does not match the hash.

### Password generation

The method will loop through an array in **req.body.rows**.

It will throw an error if **req.body.rows** is missing or empty.

New **passwords** will be added into **req.body.rows[i].pwd**.
Encrypted passwords will be added into **req.body.rows[i].encryptedPwd** .


### Configure

You do not need to initialise the library using **pwd.init()** if the default config is fine for you.

Passken will start with the following default password configuration : 

```Javascript
Options = {
  len: 12,
  num: true,
  ucase: true,
  lcase: true,
  sym: false,
  strict: true,
  exclSimilarChars: true,
};
```


### Environment variables

You do not need to intialise the library using **pwd.init()** if you are using the following environment variables:
 
```bash
  PWD_AUTO_LENGTH,
  PWD_AUTO_NUMBERS,
  PWD_AUTO_UPPERCASE,
  PWD_AUTO_LOWERCASE,
  PWD_AUTO_SYMBOLS,
  PWD_AUTO_STRICT,
  PWD_AUTO_EXCLUDE_SIMILAR_CHARS,
  PWD_SECRET,
```

These environment variables will update the default values of the lib at start up.
So you do not need to init the library in the code.

Note that **PWD_SECRET** is mandatory.


## API Reference


### Types

```javascript

type Options = {
  len: number,
  num: boolean,
  ucase: boolean,
  lcase: boolean,
  sym: boolean,
  strict: boolean,
  exclSimilarChars: boolean,
};

```

### Methods

```javascript
// Initialise passwords options
init(options: Options): void {}
// Compare a password with a hash
compare(req: Request, res: MyResponse, next: NextFunction): void {}
// Create a password
create(req: Request, res: Response, next: NextFunction): void {}

```

## Options

Any of these can be passed into the options object for each function.

| Name            |               Description                    |  Default value  |  
| :-------------- | :------------------------------------------ | :-------------- |
| len	| Integer, length of password.  |   12 |
| num*	| Boolean, put numbers in password.  |  true |
| sym*	| Boolean, put symbols in password.  |	true |
| lcase*	| Boolean, put lowercase in password   |  true |
| ucase*	| Boolean, use uppercase letters in password.   |	  true |
| exclSimilarChars	| Boolean, exclude similar chars, like 'i' and 'l'.	 |  true | 
| strict	| Boolean, password must include at least one character from each pool.	 |  true |

*At least one of those options must be true.


## Logs

Passken-express.js uses **[@dwtechs/Winstan](https://www.npmjs.com/package/@dwtechs/winstan)** library for logging.
All logs are in debug mode. Meaning they should not appear in production mode.

## Contributors

Passken-express.js is still in development and we would be glad to get all the help you can provide.
To contribute please read **[contributor.md](https://github.com/DWTechs/Passken-express.js/blob/main/contributor.md)** for detailed installation guide.


## Stack

| Purpose         |                    Choice                    |                                                     Motivation |
| :-------------- | :------------------------------------------: | -------------------------------------------------------------: |
| repository      |        [Github](https://github.com/)         |     hosting for software development version control using Git |
| package manager |     [npm](https://www.npmjs.com/get-npm)     |                                default node.js package manager |
| language        | [TypeScript](https://www.typescriptlang.org) | static type checking along with the latest ECMAScript features |
| module bundler  |      [Rollup](https://rollupjs.org)          |                        advanced module bundler for ES6 modules |
| unit testing    |          [Jest](https://jestjs.io/)          |                  delightful testing with a focus on simplicity |
