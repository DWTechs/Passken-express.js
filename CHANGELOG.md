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
