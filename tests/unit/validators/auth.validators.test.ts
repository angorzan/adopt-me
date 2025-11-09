import { describe, it, expect } from "vitest";
import {
  loginCommandSchema,
  registerCommandSchema,
  forgotPasswordCommandSchema,
  resetPasswordCommandSchema,
  type LoginCommand,
  type RegisterCommand,
} from "@lib/validators/auth.validators";

describe("Auth Validators", () => {
  describe("loginCommandSchema", () => {
    it("should validate correct login credentials", () => {
      const validData = {
        email: "user@example.com",
        password: "SecurePassword123",
      };

      const result = loginCommandSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("should validate with uppercase email and convert to lowercase", () => {
      const data = {
        email: "USER@EXAMPLE.COM",
        password: "SecurePassword123",
      };

      const result = loginCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("should reject invalid email format", () => {
      const invalidEmails = [
        { email: "notanemail", password: "Pass123" },
        { email: "missing@domain", password: "Pass123" },
        { email: "@nodomain.com", password: "Pass123" },
        { email: "spaces in@email.com", password: "Pass123" },
        { email: "", password: "Pass123" },
      ];

      invalidEmails.forEach((data) => {
        const result = loginCommandSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it("should reject missing password", () => {
      const data = {
        email: "user@example.com",
        password: "",
      };

      const result = loginCommandSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Hasło jest wymagane");
      }
    });

    it("should reject email longer than 255 characters", () => {
      const longEmail = "a".repeat(250) + "@example.com"; // 263 chars

      const data = {
        email: longEmail,
        password: "Password123",
      };

      const result = loginCommandSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("za długi");
      }
    });

    it("should accept email at exactly 255 characters", () => {
      const email = "a".repeat(240) + "@example.com"; // 255 chars exactly
      const data = {
        email,
        password: "Password123",
      };

      const result = loginCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should preserve password as-is (case sensitive)", () => {
      const data = {
        email: "user@example.com",
        password: "MyCaseSensitivePassword",
      };

      const result = loginCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.password).toBe("MyCaseSensitivePassword");
      }
    });
  });

  describe("registerCommandSchema", () => {
    const validRegisterData = {
      email: "newuser@example.com",
      password: "SecurePass123",
      confirmPassword: "SecurePass123",
      gdprConsent: true,
    };

    it("should validate correct registration data", () => {
      const result = registerCommandSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it("should require minimum 5 character password", () => {
      const tooShortPassword = {
        ...validRegisterData,
        password: "Pass",
        confirmPassword: "Pass",
      };

      const result = registerCommandSchema.safeParse(tooShortPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minimum 5");
      }
    });

    it("should accept password with exactly 5 characters", () => {
      const data = {
        ...validRegisterData,
        password: "Pass1",
        confirmPassword: "Pass1",
      };

      const result = registerCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const mismatchedData = {
        ...validRegisterData,
        password: "Password123",
        confirmPassword: "Password456",
      };

      const result = registerCommandSchema.safeParse(mismatchedData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Hasła nie są identyczne");
      }
    });

    it("should reject if gdprConsent is false", () => {
      const noConsentData = {
        ...validRegisterData,
        gdprConsent: false,
      };

      const result = registerCommandSchema.safeParse(noConsentData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Musisz zaakceptować");
      }
    });

    it("should reject if gdprConsent is missing", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { gdprConsent, ...noConsentData } = validRegisterData;

      const result = registerCommandSchema.safeParse(noConsentData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email in registration", () => {
      const invalidEmailData = {
        ...validRegisterData,
        email: "invalid-email",
      };

      const result = registerCommandSchema.safeParse(invalidEmailData);
      expect(result.success).toBe(false);
    });

    it("should handle Polish characters in email domain", () => {
      const data = {
        ...validRegisterData,
        email: "user@example.pl",
      };

      const result = registerCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should handle special characters in password", () => {
      const data = {
        ...validRegisterData,
        password: "P@ssw0rd!#$%",
        confirmPassword: "P@ssw0rd!#$%",
      };

      const result = registerCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should handle very long valid password", () => {
      const longPassword = "a".repeat(100);
      const data = {
        ...validRegisterData,
        password: longPassword,
        confirmPassword: longPassword,
      };

      const result = registerCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("forgotPasswordCommandSchema", () => {
    it("should validate with valid email", () => {
      const data = {
        email: "user@example.com",
      };

      const result = forgotPasswordCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const data = {
        email: "not-an-email",
      };

      const result = forgotPasswordCommandSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should convert email to lowercase", () => {
      const data = {
        email: "USER@EXAMPLE.COM",
      };

      const result = forgotPasswordCommandSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });
  });

  describe("resetPasswordCommandSchema", () => {
    const validResetData = {
      token: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID
      password: "NewPassword123",
      confirmPassword: "NewPassword123",
    };

    it("should validate correct reset password data", () => {
      const result = resetPasswordCommandSchema.safeParse(validResetData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID token", () => {
      const invalidTokens = [
        { ...validResetData, token: "not-a-uuid" },
        { ...validResetData, token: "550e8400-e29b-41d4-a716" },
        { ...validResetData, token: "" },
        { ...validResetData, token: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      ];

      invalidTokens.forEach((data) => {
        const result = resetPasswordCommandSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Nieprawidłowy token");
        }
      });
    });

    it("should accept valid UUID formats", () => {
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000", // Standard UUID
        "00000000-0000-0000-0000-000000000000", // All zeros
        "ffffffff-ffff-ffff-ffff-ffffffffffff", // All f's
      ];

      validUUIDs.forEach((token) => {
        const data = { ...validResetData, token };
        const result = resetPasswordCommandSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject mismatched reset passwords", () => {
      const mismatchedData = {
        ...validResetData,
        password: "NewPassword123",
        confirmPassword: "DifferentPassword456",
      };

      const result = resetPasswordCommandSchema.safeParse(mismatchedData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Hasła nie są identyczne");
      }
    });

    it("should require minimum 5 character password in reset", () => {
      const shortPasswordData = {
        ...validResetData,
        password: "Pass",
        confirmPassword: "Pass",
      };

      const result = resetPasswordCommandSchema.safeParse(shortPasswordData);
      expect(result.success).toBe(false);
    });
  });

  describe("Type inference", () => {
    it("should have correct LoginCommand type", () => {
      const loginData: LoginCommand = {
        email: "user@example.com",
        password: "password123",
      };

      expect(loginData).toHaveProperty("email");
      expect(loginData).toHaveProperty("password");
    });

    it("should have correct RegisterCommand type", () => {
      const registerData: RegisterCommand = {
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
        gdprConsent: true,
      };

      expect(registerData).toHaveProperty("gdprConsent");
    });
  });
});
