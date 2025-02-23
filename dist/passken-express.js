/*
MIT License

Copyright (c) 2025 DWTechs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/DWTechs/Passken-express.js
*/

import { isArray, isProperty, isString, isValidNumber, isNumber, isJWT } from '@dwtechs/checkard';
import * as pk from '@dwtechs/passken';
import { sign, verify } from '@dwtechs/passken';
import { log } from '@dwtechs/winstan';

const { PWD_SECRET } = process.env;
if (!PWD_SECRET)
    throw new Error("Passken: Missing PWD_SECRET environment variable");
let Opts = undefined;
function init(options) {
    Opts = options;
}
function compare(req, res, next) {
    var _a, _b;
    const pwd = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.password) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.pwd);
    if (!pwd)
        return next({ status: 400, msg: "Passken: Missing password in the request. Should be in req.body.password or req.body.pwd" });
    let dbHash = undefined;
    if (isArray(res.rows, ">", 0)) {
        const row = res.rows[0];
        if (isProperty(row, "password", true, true) && isString(row.password, "!0"))
            dbHash = row.password;
        else if (isProperty(row, "pwd", true, true) && isString(row.pwd, "!0"))
            dbHash = row.pwd;
    }
    else
        dbHash = (res === null || res === void 0 ? void 0 : res.password) || (res === null || res === void 0 ? void 0 : res.pwd);
    if (!dbHash)
        return next({ status: 400, msg: "Passken: Missing hash from the database. Should be in res.rows[0].password or res.rows[0].pwd or res.password or res.pwd" });
    log.debug(`Passken: Compare pwd=${!!pwd} & dbHash=${!!dbHash}`);
    if (!pk.compare(pwd, dbHash, PWD_SECRET))
        return next({ status: 401, msg: "Passken: Wrong password" });
    log.debug("Passken: Correct password");
    next();
}
function create(req, _res, next) {
    var _a;
    log.debug("Passken: Create password");
    if (!isArray((_a = req.body) === null || _a === void 0 ? void 0 : _a.rows, ">", 0))
        return next({ status: 400, msg: "Passken: Missing resources. Should be in req.body.rows" });
    for (const r of req.body.rows) {
        r.pwd = pk.randomPwd(Opts);
        r.encryptedPwd = pk.encrypt(r.pwd, PWD_SECRET);
    }
    next();
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { TOKEN_SECRET, ACCESS_TOKEN_DURATION, REFRESH_TOKEN_DURATION } = process.env;
if (!TOKEN_SECRET)
    throw new Error("Passken: Missing TOKEN_SECRET environment variable");
function refresh(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const iss = ((_a = req.body.decodedAccessToken) === null || _a === void 0 ? void 0 : _a.iss) || ((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.id) === null || _c === void 0 ? void 0 : _c.toString());
        if (!isValidNumber(iss, 1, 999999999, false))
            return next({ status: 400, msg: "Missing iss" });
        log.debug(`Create tokens for user ${iss}`);
        const accessDuration = isNumber(ACCESS_TOKEN_DURATION, false) ? ACCESS_TOKEN_DURATION : 600;
        const refreshDuration = isNumber(REFRESH_TOKEN_DURATION, false) ? REFRESH_TOKEN_DURATION : 86400;
        const accessToken = sign(iss, accessDuration, "access", [TOKEN_SECRET]);
        const refreshToken = sign(iss, refreshDuration, "refresh", [TOKEN_SECRET]);
        log.debug(`refreshToken='${refreshToken}', accessToken='${accessToken}'`);
        res.rows = [{ accessToken, refreshToken }];
        next();
    });
}
function decodeAccess(req, _res, next) {
    if (!req.body.protected)
        return next();
    const token = req.body.accessToken;
    const ignoreExpiration = req.body.ignoreExpiration || false;
    log.debug(`decodeAccess(token=${token}, ignoreExpiration=${ignoreExpiration})`);
    if (!isJWT(token))
        return next({ status: 401, msg: "Invalid access token" });
    let decodedToken = null;
    try {
        decodedToken = verify(token, [TOKEN_SECRET]);
    }
    catch (err) {
        return next({ status: 401, msg: `Invalid access token: ${err}` });
    }
    if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
        return next({ status: 400, msg: "Missing iss" });
    log.debug(`Decoded access token : ${JSON.stringify(decodedToken)}`);
    req.body.decodedAccessToken = decodedToken;
    next();
}
function decodeRefresh(req, _res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.body.refreshToken;
        log.debug(`decodeRefresh(token=${token})`);
        if (!isJWT(token))
            return next({ status: 401, msg: "Invalid refresh token" });
        let decodedToken = null;
        try {
            decodedToken = verify(token, [TOKEN_SECRET]);
        }
        catch (err) {
            return next({ status: 401, msg: `Invalid refresh token: ${err}` });
        }
        if (!isValidNumber(decodedToken.iss, 1, 999999999, false))
            return next({ status: 400, msg: "Missing iss" });
        log.debug(`Decoded refresh token : ${JSON.stringify(req.body.decodedToken)}`);
        req.body.decodedRefreshToken = decodedToken;
        next();
    });
}

export { compare, create, decodeAccess, decodeRefresh, init, refresh };
