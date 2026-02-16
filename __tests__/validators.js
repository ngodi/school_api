import {
  validateCreateSchool,
  validateUpdateSchool,
} from "../mws/validators.js";

describe("Input Validation Tests", () => {
  describe("validateCreateSchool", () => {
    it("should have name, address, email, and phone validators", () => {
      expect(validateCreateSchool.length).toBeGreaterThan(0);
      const names = validateCreateSchool.map((v) => v._meta?.property || "");
      expect(names).toContain("name");
      expect(names).toContain("address");
      expect(names).toContain("contactEmail");
      expect(names).toContain("phone");
    });
  });

  describe("validateUpdateSchool", () => {
    it("should have optional validators", () => {
      expect(validateUpdateSchool.length).toBeGreaterThan(0);
    });
  });
});
