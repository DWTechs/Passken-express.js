import { isArray } from "@dwtechs/checkard";
import { compare as comparePwd, encrypt, create as createPwd } from "@dwtechs/passken";
import { log } from "@dwtechs/winstan";
import type { Request, Response, NextFunction } from 'express';

const { 
  PWD_SECRET,
} = process.env;

if (!PWD_SECRET) {
  throw new Error("Missing PWD_SECRET environment variable");
}


interface MyResponse extends Response {
  rows?: any[];
  password?: string;
  pwd?: string;
}

/**
 * This function checks if a user-provided password matches a stored hashed password in a database.
 * It takes a request object req and a response object res as input, and uses a pass service to compare the password.
 * If the password is correct, it calls the next() function to proceed with the request.
 * If the password is incorrect or missing, it calls next() with an error status and message.
 */
function compare(req: Request, res: MyResponse, next: NextFunction) {
  
  const pwd = req.body?.password || req.body?.pwd; // from request
  if (!pwd) 
    return next({ status: 400, msg: "Missing password in the request. Should be in req.body.password or req.body.pwd" });
  
  let dbHash = null
  if (isArray(res.rows, ">", 0)){
    const row = res.rows[0];
    dbHash = row?.password || row?.pwd; //from db
  } else 
    dbHash = res?.password || res?.pwd;
  if (!dbHash) 
    return next({ status: 400, msg: "Missing hash from the database. Should be in res.rows[0].password or res.rows[0].pwd or res.password or res.pwd" });
  
  log.debug(`Compare Passwords: pwd=${!!pwd}, dbHash=${!!dbHash}`);
  if (comparePwd(pwd, dbHash, PWD_SECRET as string)) {
    log.debug("Correct password");
    return next();
  }
  next({ status: 401, msg: "Wrong password" });

}

/**
 * Generates random passwords for multiple users and encrypts them.
 */
function create(req: Request, _res: Response, next: NextFunction) {
  
  log.debug("create password");
  
  if (!isArray(req.body?.rows, ">", 0))
    return next({ status: 400, msg: "Missing resources. Should be in req.body.rows" });

  for (const r of req.body.rows) {
    r.pwd = createPwd();
    r.encryptedPwd = encrypt(r.pwd, PWD_SECRET as string);
  }
  next();
  
}

export default {
  compare,
  create,
};
