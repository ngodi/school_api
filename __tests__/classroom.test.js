import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import Classroom from "../managers/school/Classroom.model.js";
import User from "../managers/user/User.model.js";

// This test assumes a schoolId is available.
describe("Classroom Endpoints", () => {
  let superadminToken;
  let schooladminToken;
  let schoolId = new mongoose.Types.ObjectId();
  const password = "Password123!";
  const classroomCode = "A1";

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_TEST_URI ||
          "mongodb://localhost:27017/school_management_test",
      );
    }
    await Classroom.deleteMany({});
    await User.deleteMany({});
    // Create superadmin
    const superadmin = new User({
      email: "superadmin@classroom.com",
      passwordHash: await (await import("bcrypt")).default.hash(password, 10),
      role: "superadmin",
    });
    await superadmin.save();
    // Login as superadmin
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "superadmin@classroom.com", password });
    superadminToken = res.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a classroom by superadmin", async () => {
    const res = await request(app).post("/api/v1/admin/classrooms").send({
      name: "Class A",
      code: classroomCode,
      schoolId,
      token: superadminToken,
    });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe("Class A");
  });

  it("should not allow duplicate classroom code in same school", async () => {
    const res = await request(app).post("/api/v1/admin/classrooms").send({
      name: "Class B",
      code: classroomCode,
      schoolId,
      token: superadminToken,
    });
    expect(res.body.ok).toBe(false);
  });

  it("should list classrooms", async () => {
    const res = await request(app)
      .get("/api/v1/admin/classrooms")
      .query({ schoolId })
      .send();
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
