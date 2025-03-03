import { sign, verify} from "@dwtechs/passken";
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
    return next({ status: 400, msg: "Missing iss" });

  log.debug(`Create tokens for user ${iss}`);
  const accessToken = sign(iss, accessDuration, "access", secrets);
  const refreshToken = sign(iss, refreshDuration, "refresh", secrets);
  log.debug(`refreshToken='${refreshToken}', accessToken='${accessToken}'`);
  res.rows = [{ accessToken, refreshToken }];
  next();
}


/**
 * Middleware function to decode and verify a JWT access token from the request body.
 * 
 * @param req - The Express request object.
 * @param _res - The Express response object (unused).
 * @param next - The next middleware function in the stack.
 * 
 * The function performs the following steps:
 * 1. Checks if the route requires JWT protection. If not, it calls `next()` to proceed to the next middleware.
 * 2. Extracts the access token and the ignoreExpiration flag from the request body.
 * 3. Logs the token and ignoreExpiration flag for debugging purposes.
 * 4. Validates if the token is a valid JWT. If not, it calls `next()` with a 401 status and an error message.
 * 5. Attempts to verify the token using the `verify` function. If verification fails, it calls `next()` with a 401 status and an error message.
 * 6. Checks if the `iss` (issuer) field in the decoded token is a valid number within the specified range. If not, it calls `next()` with a 400 status and an error message.
 * 7. Logs the decoded token for debugging purposes.
 * 8. Attaches the decoded token to the request body and calls `next()` to proceed to the next middleware.
 * 
 * @throws {Object} - An error object with a status code and message if the token is invalid or missing required fields.
 */
function decodeAccess(req: Request, _res: Response, next: NextFunction) {
  if (!req.body.protected) return next(); // if no jwt protection for this route
  const token = req.body.accessToken;
  const ignoreExpiration = req.body.ignoreExpiration || false;
  log.debug(`decodeAccess(token=${token}, ignoreExpiration=${ignoreExpiration})`);

  if (!isJWT(token)) 
    return next({status: 401, msg: "Invalid access token"});

  let decodedToken = null;
  try {
    decodedToken = verify(token, secrets, true);
  } catch (err) {
    return next({status: 401, msg: `Invalid access token: ${err}`});
  }

  if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
    return next({ status: 400, msg: "Missing iss" });

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
 * @throws Will call the next middleware with a 401 status and an error message if the token is invalid.
 * @throws Will call the next middleware with a 400 status and an error message if the token is missing the 'iss' field.
 */
async function decodeRefresh(req: Request, _res: Response, next: NextFunction) {
  const token = req.body.refreshToken;
  log.debug(`decodeRefresh(token=${token})`);

  if (!isJWT(token)) 
    return next({status: 401, msg: "Invalid refresh token"});

  let decodedToken = null;
  try {
    decodedToken = verify(token, secrets, false);
  } catch (err) {
    return next({status: 401,msg: `Invalid refresh token: ${err}`});
  }

  if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
    return next({ status: 400, msg: "Missing iss" });

  log.debug(`Decoded refresh token : ${JSON.stringify(req.body.decodedToken)}`);
  req.body.decodedRefreshToken = decodedToken;
  next();
}

export {
  refresh,
  decodeAccess,
  decodeRefresh,
};
