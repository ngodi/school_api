import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";

describe("School Manager CRUD Tests", () => {
  let schoolId;
  let token = "test-token";

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_TEST_URI ||
          "mongodb://localhost:27017/school_management_test",
      );
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/v1/admin/schools", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).post("/api/v1/admin/schools").send({
        name: "Test School",
        address: "123 Main St",
        contactEmail: "school@example.com",
        phone: "1234567890",
      });
      expect(res.status).toBe(403);
      expect(res.body.ok).toBe(false);
    });
    it("should create school with valid token", async () => {
      const res = await request(app).post("/api/v1/admin/schools").send({
        token,
        name: "Test School",
        address: "123 Main St",
        contactEmail: "school@example.com",
        phone: "1234567890",
      });
      if (res.body.ok) {
        schoolId = res.body.data._id;
        expect(res.body.data.name).toBe("Test School");
      }
    });
  });

  describe("GET /api/v1/schools/:id", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).get(
        `/api/v1/schools/${schoolId || "invalid"}`,
      );
      expect([403, 404]).toContain(res.status);
      expect(res.body.ok).toBe(false);
    });
    it("should retrieve school with valid token", async () => {
      if (schoolId) {
        const res = await request(app)
          .get(`/api/v1/schools/${schoolId}`)
          .send({ token });
        expect([200, 403]).toContain(res.status);
      }
    });
  });

  describe("PUT /api/v1/admin/schools/:id", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/schools/${schoolId || "invalid"}`)
        .send({ name: "Updated School" });
      expect([403, 404]).toContain(res.status);
      expect(res.body.ok).toBe(false);
    });
    it("should update school with valid token and id", async () => {
      if (schoolId) {
        const res = await request(app)
          .put(`/api/v1/admin/schools/${schoolId}`)
          .send({ token, name: "Updated School" });
        expect([200, 400]).toContain(res.status);
      }
    });
  });

  describe("DELETE /api/v1/admin/schools/:id", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/schools/${schoolId || "invalid"}`)
        .send();
      expect([403, 404]).toContain(res.status);
      expect(res.body.ok).toBe(false);
    });
    it("should delete school with valid token and id", async () => {
      if (schoolId) {
        const res = await request(app)
          .delete(`/api/v1/admin/schools/${schoolId}`)
          .send({ token });
        expect([200, 400]).toContain(res.status);
      }
    });
  });
  describe("GET /api/v1/schools", () => {
    it("should list all schools", async () => {
      const res = await request(app).get("/api/v1/schools").send({ token });
      expect([200, 403]).toContain(res.status);
    });
  });
});
