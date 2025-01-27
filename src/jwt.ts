import { sign, verify} from "@dwtechs/passken";
import { isJWT, isValidNumber } from "@dwtechs/checkard";
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

/**
 * This function refreshes an access token for a user.
 * It retrieves the user object from the response, and then uses the tokenSvc service to get new tokens for the user.
 * The new tokens are then assigned to the response object,
 * and the function calls the next() function to proceed with the request.
 */
async function refresh(req: Request, res: MyResponse, next: NextFunction) {
  const iss = req.body.decodedAccessToken?.iss || req.body?.id?.toString();

  if (!isValidNumber(iss, 1, 999999999, false))
    return next({ status: 400, msg: "Missing iss" });

  log.debug(`Create tokens for user ${iss}`);
  const accessToken = sign(iss, ACCESS_TOKEN_DURATION, [TOKEN_SECRET]);
  const refreshToken = sign(iss, REFRESH_TOKEN_DURATION, [TOKEN_SECRET]);
  log.debug(`refreshToken='${refreshToken}', accessToken='${accessToken}'`);
  res.rows = [{ accessToken, refreshToken }];
  next();
}

/**
 * Decodes the provided token using jwtSvc.
 *
 * @param {type} token - description of the token parameter
 * @return {type} The result of the token verification
 */
function decodeAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.body.protected) return next(); // if no jwt protection for this route
  const token = req.body.accessToken;
  const ignoreExpiration = req.body.ignoreExpiration || false;
  log.debug(
    `decodeAccess(token=${token}, ignoreExpiration=${ignoreExpiration})`,
  );

  if (!isJWT(token)) return next({
    status: 401,
    msg: "Invalid access token"
  });

  const options = { ignoreExpiration };
  let decodedToken = null;
  try {
    decodedToken = verify(token, [TOKEN_SECRET]);
  } catch (err) {
    return next({
      status: 401,
      msg: `Invalid access token: ${err}`,
    });
  }

  if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
    return next({ status: 400, msg: "Missing iss" });

  log.debug(`Decoded access token : ${JSON.stringify(decodedToken)}`);
  req.body.decodedAccessToken = decodedToken;
  next();
}

/**
 * Decodes the provided token using jwtSvc.
 *
 * @param {type} token - description of the token parameter
 * @return {type} The result of the token verification
 */
async function decodeRefresh(req: Request, res: Response, next: NextFunction) {
  const token = req.body.refreshToken;
  log.debug(`decodeRefresh(token=${token})`);

  if (!isJWT(token)) return next({
    status: 401,
    msg: "Invalid refresh token",
  });

  const options = {
    ignoreExpiration: false,
  };
  const decodedToken = null;
  try {
    req.body.decodedToken = verify(token, [TOKEN_SECRET]);
  } catch (err) {
    return next({
      status: 401,
      msg: `Invalid refresh token: ${err}`,
    });
  }

  if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
    return next({ status: 400, msg: "Missing iss" });

  log.debug(
    `Decoded refresh token : ${JSON.stringify(decodedToken)}`,
  );
  next();
}

export default {
  refresh,
  decodeAccess,
  decodeRefresh,
};
