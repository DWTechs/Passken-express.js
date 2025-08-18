# 0.4.5 (Aug 18th 2025)

- Base64 secrets sent to encrypt() and compare() functions does not need to be url-safe anymore
- Update @dwtechs/hashitaka to version 0.2.3

# 0.4.4 (Aug 17th 2025)

- Update @dwtechs/hashitaka to version 0.2.2

# 0.4.3 (Aug 17th 2025)

- Add support for `pwd`, `password` and `pwdHash` properties in `res.locals` property in password comparison function

# 0.4.2 (Aug 17th 2025)

- Improve Typescript support for compare function

# 0.4.1 (Aug 16th 2025)

- Add support for `pwdHash` property in password comparison function

# 0.4.0 (Aug 12th 2025)

- Delete JWT management from the library. Now **Passken-express** is only about Passwords management. JWT features are in a new library called **@dwtechs/toker-express**

# 0.3.0 (Jul 23rd 2025)

- **BREAKING CHANGE**: Middleware now uses `req.isProtected` instead of `req.body.protected` for route protection
- **BREAKING CHANGE**: Decoded tokens are now attached to `req.decodedAccessToken` and `req.decodedRefreshToken` instead of `req.body`
- Extended Express Request interface with TypeScript declarations for better type safety
- Improved security by moving authentication properties from request body to request object

# 0.2.0 (Jul 19th 2025)

- DecodeAccess() function now handles access token from bearer token in authorization header
- Update Passken.js library to 0.4.0

# 0.1.0 (Mar 04th 2025)

- Initial release
