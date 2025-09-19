// Set environment variables BEFORE importing the module
process.env.PWD_SECRET = "YS1zdHJpbmctc2VjcmV0LWF0LWxlYXN0LTI1Ni1iaXRzLWxvbmc";

// Use require() instead of import to ensure env vars are set first
const { compare } = require("../dist/passken-express.js");
const { encrypt } = require("@dwtechs/hashitaka");

// Mock the log module
jest.mock("@dwtechs/winstan", () => ({
  log: {
    debug: jest.fn()
  }
}));

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    PWD_SECRET: "YS1zdHJpbmctc2VjcmV0LWF0LWxlYXN0LTI1Ni1iaXRzLWxvbmc"
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("compare middleware", () => {
  let req, res, next;
  const testPassword = "MySecurePassword123!";
  const secret = "YS1zdHJpbmctc2VjcmV0LWF0LWxlYXN0LTI1Ni1iaXRzLWxvbmc";

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      rows: [],
      locals: {}
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Password extraction from request", () => {

    it("should extract password from req.body.password", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should extract password from req.body.pwd", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.pwd = testPassword;
      res.rows = [{ pwd: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should extract password from req.body.pwdHash", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.pwdHash = testPassword;
      res.rows = [{ pwdHash: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should prioritize password over pwd and pwdHash", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      req.body.pwd = "wrong-password";
      req.body.pwdHash = "another-wrong-password";
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 400 error when password is missing", () => {
      res.rows = [{ password: "some-hash" }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing password in the request. Should be in req.body.password or req.body.pwd"
      });
    });

    it("should return 400 error when password is empty string", () => {
      req.body.password = "";
      res.rows = [{ password: "some-hash" }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing password in the request. Should be in req.body.password or req.body.pwd"
      });
    });

    it("should return 400 error when password is null", () => {
      req.body.password = null;
      res.rows = [{ password: "some-hash" }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing password in the request. Should be in req.body.password or req.body.pwd"
      });
    });

    it("should return 400 error when req.body is missing", () => {
      delete req.body;
      res.rows = [{ password: "some-hash" }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing password in the request. Should be in req.body.password or req.body.pwd"
      });
    });

  });

  describe("Hash extraction from response - res.rows", () => {

    it("should extract hash from res.rows[0].password", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should extract hash from res.rows[0].pwd", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [{ pwd: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should extract hash from res.rows[0].pwdHash", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [{ pwdHash: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should prioritize password over pwd and pwdHash in rows", () => {
      const hash = encrypt(testPassword, secret, true);
      const wrongHash = encrypt("wrong-password", secret, true);
      req.body.password = testPassword;
      res.rows = [{ 
        password: hash, 
        pwd: wrongHash, 
        pwdHash: wrongHash 
      }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle empty res.rows array", () => {
      req.body.password = testPassword;
      res.rows = [];
      res.password = encrypt(testPassword, secret, true);
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle non-array res.rows", () => {
      req.body.password = testPassword;
      res.rows = null;
      res.password = encrypt(testPassword, secret, true);
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle res.rows with invalid hash properties", () => {
      req.body.password = testPassword;
      res.rows = [{ 
        password: null, 
        pwd: "", 
        pwdHash: undefined 
      }];
      res.password = encrypt(testPassword, secret, true);
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

  });

  describe("Hash extraction from response - direct properties", () => {

    it("should extract hash from res.password", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.password = hash;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should extract hash from res.pwd", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.pwd = hash;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should extract hash from res.pwdHash", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.pwdHash = hash;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should prioritize direct properties over res.locals.rows", () => {
      const hash = encrypt(testPassword, secret, true);
      const wrongHash = encrypt("wrong-password", secret, true);
      req.body.password = testPassword;
      res.password = hash;
      res.locals.rows = [{ password: wrongHash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

  });

  describe("Hash extraction from response - res.locals.rows", () => {

    it("should extract hash from res.locals.rows[0].password", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.locals = { rows: [{ password: hash }] };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should extract hash from res.locals.rows[0].pwd", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.locals = { rows: [{ pwd: hash }] };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should extract hash from res.locals.rows[0].pwdHash", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.locals = { rows: [{ pwdHash: hash }] };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle empty res.locals.rows array", () => {
      req.body.password = testPassword;
      res.locals = { rows: [] };
      res.password = encrypt(testPassword, secret, true);
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle missing res.locals", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      delete res.locals;
      res.password = hash;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

  });

  describe("Missing hash scenarios", () => {

    it("should return 400 error when hash is missing from all sources", () => {
      req.body.password = testPassword;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing hash from the database. Should be in res.password or res.pwd or res.pwdHash or res.rows[0].password or res.rows[0].pwd or res.rows[0].pwdHash or res.locals.rows[0].password or res.locals.rows[0].pwd or res.locals.rows[0].pwdHash"
      });
    });

    it("should return 400 error when all hash properties are empty", () => {
      req.body.password = testPassword;
      res.password = "";
      res.pwd = null;
      res.pwdHash = undefined;
      res.rows = [{ password: "", pwd: null, pwdHash: undefined }];
      res.locals = { rows: [{ password: "", pwd: null, pwdHash: undefined }] };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing hash from the database. Should be in res.password or res.pwd or res.pwdHash or res.rows[0].password or res.rows[0].pwd or res.rows[0].pwdHash or res.locals.rows[0].password or res.locals.rows[0].pwd or res.locals.rows[0].pwdHash"
      });
    });

    it("should return 400 error when res object has no relevant properties", () => {
      req.body.password = testPassword;
      res = { unrelatedProperty: "value" };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing hash from the database. Should be in res.password or res.pwd or res.pwdHash or res.rows[0].password or res.rows[0].pwd or res.rows[0].pwdHash or res.locals.rows[0].password or res.locals.rows[0].pwd or res.locals.rows[0].pwdHash"
      });
    });

  });

  describe("Password comparison", () => {

    it("should succeed when password matches hash", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 401 error when password does not match hash", () => {
      const hash = encrypt("correct-password", secret, true);
      req.body.password = "wrong-password";
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 401,
        message: "Passken-express: Wrong password"
      });
    });

    it("should handle complex passwords with special characters", () => {
      const complexPassword = "P@ssw0rd!#$%^&*()_+{}[]|\\:;\"'<>?,.~/`";
      const hash = encrypt(complexPassword, secret, true);
      req.body.password = complexPassword;
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle long passwords", () => {
      const longPassword = "a".repeat(1000);
      const hash = encrypt(longPassword, secret, true);
      req.body.password = longPassword;
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle unicode passwords", () => {
      const unicodePassword = "Pässwörd🔐💯";
      const hash = encrypt(unicodePassword, secret, true);
      req.body.password = unicodePassword;
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should be case sensitive", () => {
      const hash = encrypt("Password123", secret, true);
      req.body.password = "password123"; // Different case
      res.rows = [{ password: hash }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 401,
        message: "Passken-express: Wrong password"
      });
    });

  });

  describe("Edge cases", () => {

    it("should handle concurrent calls with different passwords", () => {
      const password1 = "password1";
      const password2 = "password2";
      const hash1 = encrypt(password1, secret, true);
      const hash2 = encrypt(password2, secret, true);
      
      const req1 = { body: { password: password1 } };
      const req2 = { body: { password: password2 } };
      const res1 = { rows: [{ password: hash1 }] };
      const res2 = { rows: [{ password: hash2 }] };
      const next1 = jest.fn();
      const next2 = jest.fn();
      
      compare(req1, res1, next1);
      compare(req2, res2, next2);
      
      expect(next1).toHaveBeenCalledWith();
      expect(next2).toHaveBeenCalledWith();
    });

    it("should handle multiple hash sources with same password", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.password = hash;
      res.pwd = hash;
      res.pwdHash = hash;
      res.rows = [{ password: hash, pwd: hash, pwdHash: hash }];
      res.locals = { rows: [{ password: hash, pwd: hash, pwdHash: hash }] };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should handle malformed hash gracefully", () => {
      req.body.password = testPassword;
      res.rows = [{ password: "malformed-hash-not-from-encrypt" }];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: expect.stringContaining("Passken-express: Invalid input - caused by:")
      });
    });

    it("should handle empty password with valid hash", () => {
      // Use any valid hash since we expect password validation to fail before comparison
      const validHash = encrypt(testPassword, secret, true);
      req.body.password = "";
      res.rows = [{ password: validHash }];
      
      // Empty password should be caught by password validation
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing password in the request. Should be in req.body.password or req.body.pwd"
      });
    });

    it("should not modify req or res objects", () => {
      const hash = encrypt(testPassword, secret, true);
      const originalReq = { body: { password: testPassword } };
      const originalRes = { rows: [{ password: hash }] };
      req = { ...originalReq };
      res = { ...originalRes };
      
      compare(req, res, next);
      
      expect(req).toEqual(originalReq);
      expect(res).toEqual(originalRes);
    });

    it("should handle res.rows with multiple entries (use first one)", () => {
      const correctHash = encrypt(testPassword, secret, true);
      const wrongHash = encrypt("wrong-password", secret, true);
      req.body.password = testPassword;
      res.rows = [
        { password: correctHash },
        { password: wrongHash }
      ];
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

  });

  describe("Hash source priority", () => {

    it("should prioritize res.rows over res direct properties", () => {
      const correctHash = encrypt(testPassword, secret, true);
      const wrongHash = encrypt("wrong-password", secret, true);
      req.body.password = testPassword;
      res.rows = [{ password: correctHash }];
      res.password = wrongHash;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith(); // Should succeed with correct hash from rows
    });

    it("should fall back to res direct properties when res.rows is empty", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [];
      res.password = hash;
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

    it("should fall back to res.locals.rows when rows and direct properties fail", () => {
      const hash = encrypt(testPassword, secret, true);
      req.body.password = testPassword;
      res.rows = [];
      res.locals = { rows: [{ password: hash }] };
      
      compare(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
    });

  });

  describe("Integration with different hash formats", () => {

    it("should work with different passwords and consistent secret", () => {
      const passwords = ["simple", "Complex123!", "🔐🔒", "verylongpasswordwithlotsofcharacters"];
      
      passwords.forEach(password => {
        const hash = encrypt(password, secret, true);
        const testReq = { body: { password } };
        const testRes = { rows: [{ password: hash }] };
        const testNext = jest.fn();
        
        compare(testReq, testRes, testNext);
        
        expect(testNext).toHaveBeenCalledWith();
      });
    });

    it("should work with hashes generated by different encrypt calls", () => {
      // Generate hash multiple times - should still work due to salt
      const hash1 = encrypt(testPassword, secret, true);
      const hash2 = encrypt(testPassword, secret, true);
      
      // Both hashes should work with same password
      req.body.password = testPassword;
      res.rows = [{ password: hash1 }];
      compare(req, res, next);
      expect(next).toHaveBeenCalledWith();
      
      next.mockClear();
      
      res.rows = [{ password: hash2 }];
      compare(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

  });

});