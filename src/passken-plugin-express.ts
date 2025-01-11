import { compare as comp, encrypt, create as createPwd } from "@dwtechs/passken";
import { log } from "@dwtechs/winstan";

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

/**
 * This function checks if a user-provided password matches a stored hashed password in a database.
 * It takes a request object req and a response object res as input, and uses a pass service to compare the password.
 * If the password is correct, it calls the next() function to proceed with the request.
 * If the password is incorrect or missing, it calls next() with an error status and message.
 */
function compare(req, res, next) {
  const pwd = req.body.pwd; // from request
  const dbHash = res.rows[0].password; //from db
  log.debug(`Compare Passwords: pwd=${!!pwd}, dbHash=${!!dbHash}`);
  if (comp(pwd, dbHash, PWD_SECRET)) {
    log.debug("Correct password");
    return next();
  }
  return next({ status: 401, msg: "Wrong password" });
}

/**
 * Generates random passwords for multiple users and encrypts them.
 */
function create(req, res, next) {
  log.debug("create passwords");

  for (const u of req.body.rows) {
    u.pwd = createPwd({
      length: PWD_AUTO_LENGTH,
      numbers: PWD_AUTO_NUMBERS,
      uppercase: PWD_AUTO_UPPERCASE,
      lowercase: PWD_AUTO_LOWERCASE,
      symbols: PWD_AUTO_SYMBOLS,
      strict: PWD_AUTO_STRICT,
      excludeSimilarCharacters: PWD_AUTO_EXCLUDE_SIMILAR_CHARS,
    });
    u.encryptedPwd = encrypt(u.pwd, PWD_SECRET);
  }
  next();
}

export default {
  compare,
  create,
};
