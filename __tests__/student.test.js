import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import Student from "../managers/school/Student.model.js";
import User from "../managers/user/User.model.js";
import Classroom from "../managers/school/Classroom.model.js";

describe("Student Endpoints", () => {
  let superadminToken;
  let schoolId = new mongoose.Types.ObjectId();
  let classroomId;
  const password = "Password123!";
  const studentEmail = "student1@example.com";
  const admissionNumber = "ADM001";

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_TEST_URI ||
          "mongodb://localhost:27017/school_management_test",
      );
    }
    await Student.deleteMany({});
    await User.deleteMany({});
    await Classroom.deleteMany({});
    // Create superadmin
    const superadmin = new User({
      email: "superadmin@student.com",
      passwordHash: await (await import("bcrypt")).default.hash(password, 10),
      role: "superadmin",
    });
    await superadmin.save();
    // Login as superadmin
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "superadmin@student.com", password });
    superadminToken = res.body.data.token;
    // Create classroom
    const classroomRes = await request(app)
      .post("/api/v1/admin/classrooms")
      .send({ name: "Class 1", code: "C1", schoolId, token: superadminToken });
    classroomId = classroomRes.body.data._id;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a student by superadmin", async () => {
    const res = await request(app).post("/api/v1/admin/students").send({
      firstName: "John",
      lastName: "Doe",
      email: studentEmail,
      admissionNumber,
      classroomId,
      schoolId,
      token: superadminToken,
    });
    expect(res.body.ok).toBe(true);
    expect(res.body.data.email).toBe(studentEmail);
  });

  it("should not allow duplicate email or admission number", async () => {
    const res = await request(app).post("/api/v1/admin/students").send({
      firstName: "Jane",
      lastName: "Smith",
      email: studentEmail,
      admissionNumber,
      classroomId,
      schoolId,
      token: superadminToken,
    });
    expect(res.body.ok).toBe(false);
  });

  it("should list students", async () => {
    const res = await request(app)
      .get("/api/v1/admin/students")
      .query({ classroomId })
      .send();
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
