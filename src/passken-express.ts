import { isArray } from "@dwtechs/checkard";
import * as pk from "@dwtechs/passken";
import { log } from "@dwtechs/winstan";
import type { Options } from "@dwtechs/passken";
import type { Request, Response, NextFunction } from 'express';

const { PWD_SECRET } = process.env;

if (!PWD_SECRET)
  throw new Error("Passken: Missing PWD_SECRET environment variable");

let Options: Options | null = null;

interface MyResponse extends Response {
  rows?: any[];
  password?: string;
  pwd?: string;
}

function init(options: Options): void {
  Options = options;
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
    return next({ status: 400, msg: "Passken: Missing password in the request. Should be in req.body.password or req.body.pwd" });
  
  let dbHash = null
  if (isArray(res.rows, ">", 0)){
    const row = res.rows[0];
    dbHash = row?.password || row?.pwd; //from db
  } else 
    dbHash = res?.password || res?.pwd;
  if (!dbHash) 
    return next({ status: 400, msg: "Passken: Missing hash from the database. Should be in res.rows[0].password or res.rows[0].pwd or res.password or res.pwd" });
  
  log.debug(`Passken: Compare pwd=${!!pwd} & dbHash=${!!dbHash}`);
  if (!pk.compare(pwd, dbHash, PWD_SECRET as string))
    return next({ status: 401, msg: "Passken: Wrong password" });  
  
  log.debug("Passken: Correct password");
  next();
  
}

/**
 * Generates random passwords for multiple users and encrypts them.
 */
function create(req: Request, _res: Response, next: NextFunction) {
  
  log.debug("Passken: Create password");
  
  if (!isArray(req.body?.rows, ">", 0))
    return next({ status: 400, msg: "Passken: Missing resources. Should be in req.body.rows" });

  for (const r of req.body.rows) {
    r.pwd = pk.create();
    r.encryptedPwd = pk.encrypt(r.pwd, PWD_SECRET as string);
  }
  next();
  
}

export {
  init,
  compare,
  create,
};
