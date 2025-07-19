import { sign, verify, parseBearer } from "@dwtechs/passken";
import { isJWT, isNumber, isString, isValidNumber } from "@dwtechs/checkard";
import { log } from "@dwtechs/winstan";
import type { Request, Response, NextFunction } from 'express';
import type { MyResponse } from "./interfaces";

const { 
  TOKEN_SECRET, 
  ACCESS_TOKEN_DURATION,
  REFRESH_TOKEN_DURATION
} = process.env;

if (!TOKEN_SECRET)
  throw new Error("Passken: Missing TOKEN_SECRET environment variable");
if (!isString(TOKEN_SECRET, "!0"))
  throw new Error("Passken: Invalid TOKEN_SECRET environment variable");

const secrets = [TOKEN_SECRET];
const accessDuration = isNumber(ACCESS_TOKEN_DURATION, false) ? ACCESS_TOKEN_DURATION : 600; // #10 * 60 => 10 mins
const refreshDuration = isNumber(REFRESH_TOKEN_DURATION, false) ? REFRESH_TOKEN_DURATION : 86400; // #24 * 60 * 60 => 1 day


/**
 * Refreshes the JWT tokens for a user.
 *
 * This function generates new access and refresh tokens for a user based on the provided
 * decoded access token or user ID in the request body. It validates the issuer (iss) and
 * creates new tokens if the validation is successful. The new tokens are then added to the
 * response object.
 *
 * @param req - The request object containing the decoded access token or user ID.
 * @param res - The response object where the new tokens will be added.
 * @param next - The next middleware function in the Express.js request-response cycle.
 *
 * @returns Calls the next middleware function with an error if the issuer is invalid,
 *          otherwise proceeds to the next middleware function.
 */
async function refresh(req: Request, res: MyResponse, next: NextFunction) {
  const iss = req.body.decodedAccessToken?.iss || req.body?.id?.toString();

  if (!isValidNumber(iss, 1, 999999999, false))
    return next({ statusCode: 400, message: "Passken: Missing iss" });

  log.debug(`Create tokens for user ${iss}`);
  const accessToken = sign(iss, accessDuration, "access", secrets);
  const refreshToken = sign(iss, refreshDuration, "refresh", secrets);
  log.debug(`refreshToken='${refreshToken}', accessToken='${accessToken}'`);
  res.rows = [{ accessToken, refreshToken }];
  next();
}



/**
 * Express middleware function to decode and verify an access token from the Authorization header.
 * 
 * This middleware extracts the JWT access token from the Authorization header, validates its format,
 * verifies its signature, and attaches the decoded token to the request body for use by subsequent
 * middleware. It only processes requests that have `req.body.protected` set to true.
 * 
 * @param {Request} req - The Express request object containing the Authorization header and body
 * @param {Response} _res - The Express response object (not used in this function)
 * @param {NextFunction} next - The next middleware function to be called
 * 
 * @returns {void} Calls the next middleware function, either with an error or successfully
 * 
 * @throws {Object} Will call next() with appropriate status codes based on error types
 * 
 * @example
 * ```typescript
 * // Usage in Express route
 * app.post('/protected-route', decodeAccess, (req, res) => {
 *   // Access the decoded token
 *   const userId = req.body.decodedAccessToken.iss;
 *   res.json({ message: `Hello user ${userId}` });
 * });
 * 
 * // Request headers should include:
 * // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * // Request body should include:
 * // { "protected": true }
 * ```
 * 
 */
function decodeAccess(req: Request, _res: Response, next: NextFunction) {
  if (!req.body.protected) return next(); // if no jwt protection for this route
  
  log.debug(`decode access token`);

  let t: string;
  try {
    t = parseBearer(req.headers.authorization);
  } catch (e: any) {
    return next(e);
  }

  log.debug(`accessToken : ${t}`);

  if (!isJWT(t)) 
    return next({statusCode: 401, message: "Passken: Invalid access token"});

  let decodedToken = null;
  try {
    decodedToken = verify(t, secrets, true);
  } catch (e: any) {
    return next(e);
  }

  if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
    return next({ statusCode: 400, message: "Passken: Missing iss" });

  log.debug(`Decoded access token : ${JSON.stringify(decodedToken)}`);
  req.body.decodedAccessToken = decodedToken;
  next();
}


/**
 * Middleware function to decode and verify a refresh token from the request body.
 * 
 * @param req - The request object containing the refresh token in the body.
 * @param _res - The response object (not used in this function).
 * @param next - The next middleware function to be called.
 * 
 * @returns Calls the next middleware function with an error object if the token is invalid or missing required fields.
 * 
 * @throws Will call the next middleware with appropriate status codes based on error types.
 */
async function decodeRefresh(req: Request, _res: Response, next: NextFunction) {
  const token = req.body.refreshToken;
  log.debug(`decodeRefresh(token=${token})`);

  if (!isJWT(token)) 
    return next({statusCode: 401, message: "Passken: Invalid refresh token"});

  let decodedToken = null;
  try {
    decodedToken = verify(token, secrets, false);
  } catch (e: any) {
    return next(e);
  }

  if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
    return next({ statusCode: 400, message: "Passken: Missing iss" });

  log.debug(`Decoded refresh token : ${JSON.stringify(req.body.decodedToken)}`);
  req.body.decodedRefreshToken = decodedToken;
  next();
}

export {
  refresh,
  decodeAccess,
  decodeRefresh,
};
