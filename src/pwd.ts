import { isArray, isString, isProperty } from "@dwtechs/checkard";
import { randomPwd } from "@dwtechs/passken";
import { encrypt, compare as comparePWD } from "@dwtechs/hashitaka";
import { log } from "@dwtechs/winstan";
import type { Options } from "@dwtechs/passken";
import type { Request, Response, NextFunction } from 'express';
import type { MyResponse } from "./interfaces";

const { PWD_SECRET } = process.env;

/**
 * Prefix for all error messages
 */
const PE_PREFIX = "Passken-express: ";

if (!PWD_SECRET)
  throw new Error(`${PE_PREFIX}Missing PWD_SECRET environment variable`);

let Opts: Options | undefined = undefined;

/**
 * Initializes the password generation options for the Passken-express library.
 * 
 * This function sets the global password options that will be used by the `create` function
 * when generating random passwords. The options control password characteristics such as
 * length, character sets, and complexity requirements.
 * 
 * @param {Options} options - Password generation options from @dwtechs/passken
 * @param {number}  options.len - Password length (minimum characters)
 * @param {boolean} options.num - Include numbers in password
 * @param {boolean} options.ucase - Include uppercase letters
 * @param {boolean} options.lcase - Include lowercase letters  
 * @param {boolean} options.sym - Include symbols in password
 * @param {boolean} options.strict - Password must include at least one character from each enabled pool
 * @param {boolean} options.similarChars - Allow visually similar characters (l, I, 1, o, O, 0)
 * 
 * @returns {void}
 * 
 * @example
 * ```typescript
 * import { init } from '@dwtechs/passken-express';
 * 
 * // Initialize with custom password options
 * init({
 *   len: 16,
 *   num: true,
 *   ucase: true,
 *   lcase: true,
 *   sym: true,
 *   strict: true,
 *   similarChars: false
 * });
 * ```
 */
function init(options: Options): void {
  Opts = options;
}

/**
 * Express middleware to compare a user-provided password with a stored hashed password.
 * 
 * This middleware validates that a plaintext password from the request matches a hashed
 * password from the database. It extracts the password from the request body and the
 * hash from either the response rows or response object, then uses Passken's secure
 * comparison function to verify the match.
 * 
 * @param {Request} req - Express request object containing the password
 * @param {MyResponse} res - Express response object containing the database hash
 * @param {NextFunction} next - Express next function to continue middleware chain
 * 
 * @returns {void} Calls next() to continue, or next(error) on failure
 * 
 * @throws {InvalidPasswordError} If the password is invalid or does not match the hash (HTTP 400)
 * @throws {InvalidBase64SecretError} If the secret is not a valid base64 string (HTTP 400)
 * @throws {Object} Will call next() with error object containing:
 *   - statusCode: 400 - When password is missing from request body
 *   - statusCode: 400 - When hash is missing from response data
 *   - statusCode: 401 - When password doesn't match the stored hash
 * 
 * @example
 * ```typescript
 * import { compare } from '@dwtechs/passken-express';
 * 
 * // Usage in Express route after database query
 * app.post('/login', getUserFromDB, compare, (req, res) => {
 *   res.json({ message: 'Login successful' });
 * });
 * 
 * // Request body should contain:
 * // { "password": "user-password" } or { "pwd": "user-password" }
 * 
 * // Response should contain hash from database:
 * // res.rows[0].password or res.rows[0].pwd or res.password or res.pwd
 * ```
 */
function compare(req: Request, res: MyResponse, next: NextFunction) {
  
  log.debug(`${PE_PREFIX}compare password hashes`);

  const pwd = req.body?.password || req.body?.pwd || req.body?.pwdHash; // from request
  if (!pwd) 
    return next({ statusCode: 400, message: `${PE_PREFIX}Missing password in the request. Should be in req.body.password or req.body.pwd` });
  
  let dbHash: string | undefined = undefined;
  
  if (isArray(res.rows, ">", 0)) {
    const r = res.rows[0];
    if (isProperty(r, "password", true, true) && isString(r.password, "!0"))
      dbHash = r.password;
    else if (isProperty(r, "pwd", true, true) && isString(r.pwd, "!0"))
      dbHash = r.pwd;
    else if (isProperty(r, "pwdHash", true, true) && isString(r.pwdHash, "!0"))
      dbHash = r.pwdHash;
  } else 
    dbHash = res.password || res.pwd || res.pwdHash;

  if (isArray(res.locals?.rows, ">", 0)) {
    const r = res.locals.rows[0] as Object;
    if (isProperty(r, "password", true, true) && isString(r.password, "!0"))
      dbHash = r.password;
    else if (isProperty(r, "pwd", true, true) && isString(r.pwd, "!0"))
      dbHash = r.pwd;
    else if (isProperty(r, "pwdHash", true, true) && isString(r.pwdHash, "!0"))
      dbHash = r.pwdHash;
  } else 
    dbHash = res.password || res.pwd || res.pwdHash;

  if (!dbHash) 
    return next({ statusCode: 400, message: `${PE_PREFIX}Missing hash from the database. Should be in res.password or res.pwd or res.pwdHash or res.rows[0].password or res.rows[0].pwd or res.rows[0].pwdHash or res.locals.rows[0].password or res.locals.rows[0].pwd or res.locals.rows[0].pwdHash` });
  
  if (!comparePWD(pwd, dbHash, PWD_SECRET as string))
    return next({ statusCode: 401, message: `${PE_PREFIX}Wrong password` });

  log.debug(`${PE_PREFIX}Correct password`);
  next();
  
}

/**
 * Express middleware to generate random passwords and encrypt them for multiple users.
 * 
 * This middleware generates secure random passwords for multiple user records and encrypts
 * them using Passken's encryption function. It processes an array of user objects in the
 * request body, adding both plaintext and encrypted password fields to each record.
 * The plaintext passwords can be sent to users (e.g., via email) while encrypted passwords
 * are stored in the database.
 * 
 * @param {Request} req - Express request object containing user records in body.rows
 * @param {Response} _res - Express response object (not used in this function)
 * @param {NextFunction} next - Express next function to continue middleware chain
 * 
 * @returns {void} Calls next() to continue, or next(error) on failure
 * 
 * @throws {InvalidPasswordError} If password generation or encryption fails (HTTP 400)
 * @throws {InvalidBase64SecretError} If the secret is not a valid base64 string (HTTP 400)
 * @throws {Object} Will call next() with error object containing:
 *   - statusCode: 400 - When req.body.rows is missing or not an array
 * 
 * @example
 * ```typescript
 * import { create } from '@dwtechs/passken-express';
 * 
 * // Usage in Express route for bulk user creation
 * app.post('/users/bulk', create, saveUsersToDatabase, (req, res) => {
 *   // Send plaintext passwords to users via email
 *   req.body.rows.forEach(user => {
 *     sendPasswordEmail(user.email, user.pwd);
 *   });
 *   res.json({ message: 'Users created successfully' });
 * });
 * 
 * // Request body should contain:
 * // { "rows": [{ "name": "User1", "email": "user1@example.com" }, ...] }
 * 
 * // After processing, each row will have:
 * // { "name": "User1", "email": "user1@example.com", "pwd": "generated-password", "encryptedPwd": "encrypted-hash" }
 * ```
 */
function create(req: Request, _res: Response, next: NextFunction) {

  log.debug(`${PE_PREFIX}Create password`);

  if (!isArray(req.body?.rows, ">", 0))
    return next({ statusCode: 400, message: `${PE_PREFIX}Missing resources. Should be in req.body.rows` });

  for (const r of req.body.rows) {
    r.pwd = randomPwd(Opts);
    r.encryptedPwd = encrypt(r.pwd, PWD_SECRET as string);
  }
  next();
  
}

export {
  init,
  compare,
  create,
};
