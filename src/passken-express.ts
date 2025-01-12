import { compare as comp, encrypt, create as createPwd } from "@dwtechs/passken";
import { log } from "@dwtechs/winstan";
import type { Request, Response, NextFunction } from 'express';

const conf = null;

// check for env variables
if (process?.env) {
  const { 
    PWD_AUTO_LENGTH,
    PWD_AUTO_NUMBERS,
    PWD_AUTO_UPPERCASE,
    PWD_AUTO_LOWERCASE,
    PWD_AUTO_SYMBOLS,
    PWD_AUTO_STRICT,
    PWD_AUTO_EXCLUDE_SIMILAR_CHARS,
    PWD_SECRET,
  } = process.env;
  const conf ={
    len: PWD_AUTO_LENGTH as unknown as number,
    num: PWD_AUTO_NUMBERS as unknown as boolean,
    ucase: PWD_AUTO_UPPERCASE as unknown as boolean,
    lcase: PWD_AUTO_LOWERCASE as unknown as boolean,
    sym: PWD_AUTO_SYMBOLS as unknown as boolean,
    strict: PWD_AUTO_STRICT as unknown as boolean,
    exclSimilarChars: PWD_AUTO_EXCLUDE_SIMILAR_CHARS as unknown as boolean,
  };

  if (!PWD_SECRET) {
    throw new Error("Missing PWD_SECRET environment variable");
  }

}


interface MyResponse extends Response {
  rows: any[];
}

/**
 * This function checks if a user-provided password matches a stored hashed password in a database.
 * It takes a request object req and a response object res as input, and uses a pass service to compare the password.
 * If the password is correct, it calls the next() function to proceed with the request.
 * If the password is incorrect or missing, it calls next() with an error status and message.
 */
function compare(req: Request, res: MyResponse, next: NextFunction) {
  const pwd = req.body.pwd; // from request
  const dbHash = res.rows[0].password; //from db
  log.debug(`Compare Passwords: pwd=${!!pwd}, dbHash=${!!dbHash}`);
  if (comp(pwd, dbHash, PWD_SECRET as string)) {
    log.debug("Correct password");
    return next();
  }
  next({ status: 401, msg: "Wrong password" });
}

/**
 * Generates random passwords for multiple users and encrypts them.
 */
function create(req: Request, _res: Response, next: NextFunction): void {
  log.debug("create passwords");

  for (const u of req.body.rows) {
    u.pwd = createPwd(conf);
    u.encryptedPwd = encrypt(u.pwd, PWD_SECRET as string);
  }
  next();
}

export default {
  compare,
  create,
};
