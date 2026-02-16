import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { app, server } from "../index.js";
import User from "../managers/users/User.model.js";
import School from "../managers/schools/School.model.js";

describe("User Endpoints", () => {
  let superadminToken;
  let schooladminToken;
  let schoolId;
  const superadminEmail = `superadmin_${Date.now()}@example.com`;
  const schooladminEmail = `schooladmin_${Date.now()}@example.com`;
  const password = "Password123!";
  const schoolName = `Test School ${Date.now()}`;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();

    // Create superadmin
    const superadmin = new User({
      email: superadminEmail,
      passwordHash: await bcrypt.hash(password, 10),
      role: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      phone: "1234567890",
    });
    await superadmin.save();

    // Login superadmin
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: superadminEmail, password });
    superadminToken = res.body.data.token;

    // Create school
    const school = new School({
      name: schoolName,
      address: "123 Main St",
      contactEmail: "contact@example.com",
      phone: "1234567890",
      createdBy: superadmin._id,
    });
    await school.save();
    schoolId = school._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    await new Promise((resolve) => server.close(resolve));
  });

  it("should create a school_admin by superadmin", async () => {
    const res = await request(app)
      .post("/api/v1/users/create")
      .set("Authorization", `Bearer ${superadminToken}`)
      .send({
        email: schooladminEmail,
        password,
        role: "schooladmin",
        schoolId,
        firstName: "John",
        lastName: "Doe",
      });

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(schooladminEmail);
  });

  it("should NOT create a school_admin when not AUTHENTICATED", async () => {
    const res = await request(app)
      .post("/api/v1/users/create")
      .send({
        email: `unauth_${Date.now()}@example.com`,
        password,
        role: "schooladmin",
        schoolId,
        firstName: "John",
        lastName: "Doe",
      });
    console.log(res.body);
    expect(res.body.success).toBe(false);
    expect(res.status).toBe(401);
  });

  it("should login as schooladmin", async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: schooladminEmail, password });

    schooladminToken = res.body.data.token;

    expect(res.body.success).toBe(true);
  });

  it("should logout as schooladmin", async () => {
    const res = await request(app)
      .post("/api/v1/users/logout")
      .set("Authorization", `Bearer ${schooladminToken}`);

    expect(res.body.success).toBe(true);
  });

  it("should not allow duplicate email", async () => {
    const res = await request(app)
      .post("/api/v1/users/create")
      .set("Authorization", `Bearer ${superadminToken}`)
      .send({
        email: schooladminEmail,
        password,
        role: "schooladmin",
        schoolId,
        firstName: "John",
        lastName: "Doe",
      });

    expect(res.body.success).toBe(false);
  });
});
