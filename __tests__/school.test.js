import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { app, server } from "../index.js";
import User from "../managers/users/User.model.js";
import School from "../managers/schools/School.model.js";

let schoolId;
let superadminToken;
let superadminId;

const password = "Password123!";
const superadminEmail = `superadmin_${Date.now()}@school.com`;

const schoolCreateParams = {
  name: "Test School",
  address: "123 Main St",
  contactEmail: "school@example.com",
  phone: "1234567890",
};

describe("School Manager CRUD Tests", () => {
  beforeAll(async () => {
    await mongoose.connection.dropDatabase();

    const superadmin = new User({
      email: superadminEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      phone: "1234567890",
    });
    await superadmin.save();
    superadminId = superadmin._id;

    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: superadminEmail, password });

    superadminToken = res.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  describe("POST /api/v1/schools/create", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/v1/schools/create")
        .send(schoolCreateParams);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should create school with valid token", async () => {
      const res = await request(app)
        .post("/api/v1/schools/create")
        .set("Authorization", `Bearer ${superadminToken}`)
        .send(schoolCreateParams);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Test School");

      schoolId = res.body.data._id;
    });
  });

  describe("GET /api/v1/schools/get", () => {
    let school;

    beforeAll(async () => {
      school = new School({
        ...schoolCreateParams,
        name: "Douala School2",
        createdBy: superadminId,
      });
      await school.save();
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .get(`/api/v1/schools/get`)
        .query({ schoolId: school._id.toString() });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should retrieve school with valid token", async () => {
      const res = await request(app)
        .get(`/api/v1/schools/get`)
        .query({ schoolId: school._id.toString() })
        .set("Authorization", `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(school._id.toString());
    });
  });

  describe("PUT /api/v1/schools/update", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .put(`/api/v1/schools/update`)
        .query({ schoolId })
        .send({ name: "Updated School" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should update school with valid token and id", async () => {
      const res = await request(app)
        .put(`/api/v1/schools/update`)
        .query({ schoolId })
        .set("Authorization", `Bearer ${superadminToken}`)
        .send({ name: "Updated School" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Updated School");
    });
  });

  describe("GET /api/v1/schools/list", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).get("/api/v1/schools/list");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should list all schools with valid token", async () => {
      const res = await request(app)
        .get("/api/v1/schools/list")
        .set("Authorization", `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.schools)).toBe(true);
    });
  });

  describe("DELETE /api/v1/schools/remove", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .delete(`/api/v1/schools/remove`)
        .query({ schoolId });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should delete school with valid token and id", async () => {
      const res = await request(app)
        .delete(`/api/v1/schools/remove`)
        .query({ schoolId })
        .set("Authorization", `Bearer ${superadminToken}`);

      expect(res.status).toBe(204);
    });
  });
});
