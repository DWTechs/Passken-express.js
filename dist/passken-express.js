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

import { compare as compare$1, create as create$1, encrypt } from '@dwtechs/passken';
import { log } from '@dwtechs/winstan';

const { PWD_AUTO_LENGTH, PWD_AUTO_NUMBERS, PWD_AUTO_UPPERCASE, PWD_AUTO_LOWERCASE, PWD_AUTO_SYMBOLS, PWD_AUTO_STRICT, PWD_AUTO_EXCLUDE_SIMILAR_CHARS, PWD_SECRET, } = process.env;
function compare(req, res, next) {
    const pwd = req.body.pwd;
    const dbHash = res.rows[0].password;
    log.debug(`Compare Passwords: pwd=${!!pwd}, dbHash=${!!dbHash}`);
    if (compare$1(pwd, dbHash, PWD_SECRET)) {
        log.debug("Correct password");
        return next();
    }
    next({ status: 401, msg: "Wrong password" });
}
function create(req, _res, next) {
    log.debug("create passwords");
    for (const u of req.body.rows) {
        u.pwd = create$1({
            len: PWD_AUTO_LENGTH,
            num: PWD_AUTO_NUMBERS,
            ucase: PWD_AUTO_UPPERCASE,
            lcase: PWD_AUTO_LOWERCASE,
            sym: PWD_AUTO_SYMBOLS,
            strict: PWD_AUTO_STRICT,
            exclSimilarChars: PWD_AUTO_EXCLUDE_SIMILAR_CHARS,
        });
        u.encryptedPwd = encrypt(u.pwd, PWD_SECRET);
    }
    next();
}
var passkenExpress = {
    compare,
    create,
};

export { passkenExpress as default };
