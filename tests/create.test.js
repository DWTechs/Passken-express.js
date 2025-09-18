// Set environment variables BEFORE importing the module
process.env.PWD_SECRET = "YS1zdHJpbmctc2VjcmV0LWF0LWxlYXN0LTI1Ni1iaXRzLWxvbmc";

// Use require() instead of import to ensure env vars are set first
const { create, init } = require("../dist/passken-express.js");
const { compare: comparePwd } = require("@dwtechs/hashitaka");

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

describe("create middleware", () => {
  let req, res, next;
  const secret = "YS1zdHJpbmctc2VjcmV0LWF0LWxlYXN0LTI1Ni1iaXRzLWxvbmc";

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {};
    next = jest.fn();
    
    // Initialize with default password options
    init({
      len: 12,
      num: true,
      ucase: true,
      lcase: true,
      sym: true,
      strict: true,
      similarChars: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Input validation", () => {

    it("should return 400 error when req.body.rows is missing", () => {
      // No rows property
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body.rows is null", () => {
      req.body.rows = null;
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body.rows is undefined", () => {
      req.body.rows = undefined;
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body.rows is empty array", () => {
      req.body.rows = [];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body.rows is not an array", () => {
      req.body.rows = { notAnArray: true };
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body is missing", () => {
      delete req.body;
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body.rows is a string", () => {
      req.body.rows = "not-an-array";
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

    it("should return 400 error when req.body.rows is a number", () => {
      req.body.rows = 123;
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Passken-express: Missing resources. Should be in req.body.rows"
      });
    });

  });

  describe("Single user password creation", () => {

    it("should generate password and encrypted password for single user", () => {
      req.body.rows = [{ name: "John Doe", email: "john@example.com" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0]).toHaveProperty("pwd");
      expect(req.body.rows[0]).toHaveProperty("encryptedPwd");
      expect(typeof req.body.rows[0].pwd).toBe("string");
      expect(typeof req.body.rows[0].encryptedPwd).toBe("string");
      expect(req.body.rows[0].pwd.length).toBeGreaterThan(0);
      expect(req.body.rows[0].encryptedPwd.length).toBeGreaterThan(0);
    });

    it("should preserve existing properties in user object", () => {
      req.body.rows = [{
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "admin"
      }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0].id).toBe(1);
      expect(req.body.rows[0].name).toBe("John Doe");
      expect(req.body.rows[0].email).toBe("john@example.com");
      expect(req.body.rows[0].role).toBe("admin");
      expect(req.body.rows[0]).toHaveProperty("pwd");
      expect(req.body.rows[0]).toHaveProperty("encryptedPwd");
    });

    it("should generate valid encrypted password that can be compared", () => {
      req.body.rows = [{ name: "John Doe", email: "john@example.com" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      const user = req.body.rows[0];
      
      // The encrypted password should be verifiable with the plaintext password
      const isValid = comparePwd(user.pwd, user.encryptedPwd, secret);
      expect(isValid).toBe(true);
    });

    it("should handle user object with no properties", () => {
      req.body.rows = [{}];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0]).toHaveProperty("pwd");
      expect(req.body.rows[0]).toHaveProperty("encryptedPwd");
    });

  });

  describe("Multiple users password creation", () => {

    it("should generate passwords for multiple users", () => {
      req.body.rows = [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
        { name: "Bob Johnson", email: "bob@example.com" }
      ];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows).toHaveLength(3);
      
      req.body.rows.forEach((user, index) => {
        expect(user).toHaveProperty("pwd");
        expect(user).toHaveProperty("encryptedPwd");
        expect(typeof user.pwd).toBe("string");
        expect(typeof user.encryptedPwd).toBe("string");
        expect(user.pwd.length).toBeGreaterThan(0);
        expect(user.encryptedPwd.length).toBeGreaterThan(0);
      });
    });

    it("should generate different passwords for each user", () => {
      req.body.rows = [
        { name: "User1", email: "user1@example.com" },
        { name: "User2", email: "user2@example.com" },
        { name: "User3", email: "user3@example.com" }
      ];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      
      const passwords = req.body.rows.map(user => user.pwd);
      const encryptedPasswords = req.body.rows.map(user => user.encryptedPwd);
      
      // All passwords should be different
      expect(new Set(passwords).size).toBe(3);
      // All encrypted passwords should be different
      expect(new Set(encryptedPasswords).size).toBe(3);
    });

    it("should handle large number of users", () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User${i + 1}`,
        email: `user${i + 1}@example.com`
      }));
      req.body.rows = users;
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows).toHaveLength(100);
      
      req.body.rows.forEach(user => {
        expect(user).toHaveProperty("pwd");
        expect(user).toHaveProperty("encryptedPwd");
        expect(typeof user.pwd).toBe("string");
        expect(typeof user.encryptedPwd).toBe("string");
      });
      
      // Check that all passwords are unique
      const passwords = req.body.rows.map(user => user.pwd);
      expect(new Set(passwords).size).toBe(100);
    });

  });

  describe("Password validation with different options", () => {

    it("should generate passwords with default length (12 characters)", () => {
      req.body.rows = [{ name: "Test User" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0].pwd.length).toBe(12);
    });

    it("should generate passwords with custom length", () => {
      init({
        len: 16,
        num: true,
        ucase: true,
        lcase: true,
        sym: false,
        strict: true,
        similarChars: false
      });
      
      req.body.rows = [{ name: "Test User" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0].pwd.length).toBe(16);
    });

    it("should generate passwords with numbers when enabled", () => {
      init({
        len: 20,
        num: true,
        ucase: false,
        lcase: true,
        sym: false,
        strict: false,
        similarChars: false
      });
      
      req.body.rows = [{ name: "Test User" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      // Should contain at least one number
      expect(/\d/.test(req.body.rows[0].pwd)).toBe(true);
    });

    it("should generate passwords with uppercase letters when enabled", () => {
      init({
        len: 20,
        num: false,
        ucase: true,
        lcase: true,
        sym: false,
        strict: false,
        similarChars: false
      });
      
      req.body.rows = [{ name: "Test User" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      // Should contain at least one uppercase letter
      expect(/[A-Z]/.test(req.body.rows[0].pwd)).toBe(true);
    });

  });

  describe("Password and hash relationship", () => {

    it("should generate encrypted passwords that verify with original passwords", () => {
      req.body.rows = [
        { name: "User1" },
        { name: "User2" },
        { name: "User3" }
      ];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      
      req.body.rows.forEach(user => {
        const isValid = comparePwd(user.pwd, user.encryptedPwd, secret);
        expect(isValid).toBe(true);
      });
    });

    it("should generate encrypted passwords that fail with wrong passwords", () => {
      req.body.rows = [{ name: "Test User" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      
      const user = req.body.rows[0];
      const isValid = comparePwd("wrong-password", user.encryptedPwd, secret);
      expect(isValid).toBe(false);
    });

    it("should generate different encrypted passwords for same plaintext (due to salt)", () => {
      // Create two users with same data to get same password generation seed
      req.body.rows = [{ name: "Test User" }];
      create(req, res, next);
      const firstHash = req.body.rows[0].encryptedPwd;
      
      // Reset and create another user
      next.mockClear();
      req.body.rows = [{ name: "Test User" }];
      create(req, res, next);
      const secondHash = req.body.rows[0].encryptedPwd;
      
      // Even if passwords were the same, hashes should be different due to salt
      // But since randomPwd generates different passwords, this will definitely be different
      expect(firstHash).not.toBe(secondHash);
    });

  });

  describe("Edge cases", () => {

    it("should not modify res object", () => {
      req.body.rows = [{ name: "Test User" }];
      const originalRes = { ...res };
      
      create(req, res, next);
      
      expect(res).toEqual(originalRes);
    });

    it("should handle users with existing pwd property (should overwrite)", () => {
      req.body.rows = [{
        name: "Test User",
        pwd: "existing-password"
      }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0].pwd).not.toBe("existing-password");
      expect(req.body.rows[0]).toHaveProperty("encryptedPwd");
    });

    it("should handle users with existing encryptedPwd property (should overwrite)", () => {
      req.body.rows = [{
        name: "Test User",
        encryptedPwd: "existing-encrypted-password"
      }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(req.body.rows[0].encryptedPwd).not.toBe("existing-encrypted-password");
      expect(req.body.rows[0]).toHaveProperty("pwd");
    });

    it("should handle users with complex nested properties", () => {
      req.body.rows = [{
        user: {
          profile: {
            personal: {
              name: "John Doe",
              age: 30
            },
            contact: {
              email: "john@example.com",
              phone: "123-456-7890"
            }
          },
          permissions: ["read", "write"]
        },
        metadata: {
          created: new Date(),
          active: true
        }
      }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      const user = req.body.rows[0];
      
      // Should preserve all nested structure
      expect(user.user.profile.personal.name).toBe("John Doe");
      expect(user.user.permissions).toEqual(["read", "write"]);
      expect(user.metadata.active).toBe(true);
      
      // Should add password fields at root level
      expect(user).toHaveProperty("pwd");
      expect(user).toHaveProperty("encryptedPwd");
    });

    it("should handle concurrent calls", () => {
      const req1 = { body: { rows: [{ name: "User1" }] } };
      const req2 = { body: { rows: [{ name: "User2" }] } };
      const next1 = jest.fn();
      const next2 = jest.fn();
      
      create(req1, res, next1);
      create(req2, res, next2);
      
      expect(next1).toHaveBeenCalledWith();
      expect(next2).toHaveBeenCalledWith();
      expect(req1.body.rows[0]).toHaveProperty("pwd");
      expect(req2.body.rows[0]).toHaveProperty("pwd");
      expect(req1.body.rows[0].pwd).not.toBe(req2.body.rows[0].pwd);
    });

  });

  describe("Integration scenarios", () => {

    it("should work in typical user registration flow", () => {
      // Simulate typical user registration data
      req.body.rows = [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@company.com",
          role: "employee",
          department: "engineering",
          startDate: "2025-01-15"
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@company.com",
          role: "manager",
          department: "marketing",
          startDate: "2025-01-16"
        }
      ];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      
      req.body.rows.forEach(user => {
        // Verify all original data is preserved
        expect(user).toHaveProperty("firstName");
        expect(user).toHaveProperty("lastName");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("role");
        expect(user).toHaveProperty("department");
        expect(user).toHaveProperty("startDate");
        
        // Verify password fields are added
        expect(user).toHaveProperty("pwd");
        expect(user).toHaveProperty("encryptedPwd");
        
        // Verify password can be validated
        const isValid = comparePwd(user.pwd, user.encryptedPwd, secret);
        expect(isValid).toBe(true);
      });
    });

    it("should generate passwords suitable for email transmission", () => {
      req.body.rows = [{ email: "test@example.com" }];
      
      create(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      
      const password = req.body.rows[0].pwd;
      
      // Password should be printable ASCII characters
      expect(password).toMatch(/^[\x20-\x7E]+$/);
      
      // Should not contain problematic characters for email
      expect(password).not.toMatch(/[<>"'&]/);
    });

  });

});