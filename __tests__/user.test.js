import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import User from "../managers/user/User.model.js";

describe("User Endpoints", () => {
  let superadminToken;
  let schooladminToken;
  let schoolId;
  const superadminEmail = "superadmin@example.com";
  const schooladminEmail = "schooladmin@example.com";
  const password = "Password123!";

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_TEST_URI ||
          "mongodb://localhost:27017/school_management_test",
      );
    }
    await User.deleteMany({});
    // Create superadmin user directly in DB
    const superadmin = new User({
      email: superadminEmail,
      passwordHash: await (await import("bcrypt")).default.hash(password, 10),
      role: "superadmin",
    });
    await superadmin.save();
    // Login as superadmin
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: superadminEmail, password });
    superadminToken = res.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a school_admin by superadmin", async () => {
    const res = await request(app).post("/api/v1/admin/users").send({
      email: schooladminEmail,
      password,
      role: "school_admin",
      schoolId: "dummySchoolId", // adjust as needed for your logic
      token: superadminToken,
    });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.email).toBe(schooladminEmail);
  });

  it("should login as school_admin", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: schooladminEmail, password });
    expect(res.body.ok).toBe(true);
    schooladminToken = res.body.data.token;
  });

  it("should logout as school_admin", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .send({ token: schooladminToken });
    expect(res.body.ok).toBe(true);
  });

  it("should not allow duplicate email", async () => {
    const res = await request(app).post("/api/v1/admin/users").send({
      email: schooladminEmail,
      password,
      role: "school_admin",
      schoolId: "dummySchoolId",
      token: superadminToken,
    });
    expect(res.body.ok).toBe(false);
  });
});
