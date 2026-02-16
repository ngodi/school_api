import request from "supertest";
import { app, server } from "../index.js";
import mongoose from "mongoose";
import User from "../managers/users/User.model.js";

describe("Student Endpoints", () => {
  let superadminToken;
  let superadminId;
  let schoolId = new mongoose.Types.ObjectId();
  let classroomId;
  const password = "Password123!";
  const studentEmail = "student1@example.com";
  const admissionNumber = "ADM001";

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();

    // Create superadmin
    const superadmin = new User({
      email: "superadmin@student.com",
      passwordHash: await (await import("bcrypt")).default.hash(password, 10),
      role: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      phone: "1234567890",
    });
    await superadmin.save();
    // Login as superadmin
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: "superadmin@student.com", password });

    superadminId = res.body.data._id;
    superadminToken = res.body.data.token;
    // Create classroom
    const classroomRes = await request(app)
      .post("/api/v1/classrooms/create")
      .send({ name: "Class 1", code: "C1", schoolId })
      .set({ Authorization: `Bearer ${superadminToken}` });

    classroomId = classroomRes.body.data._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    await new Promise((resolve) => server.close(resolve));
  });

  it("should create a student by superadmin", async () => {
    const res = await request(app)
      .post("/api/v1/students/create")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: studentEmail,
        admissionNumber,
        classroomId,
        schoolId,
      })
      .set({ Authorization: `Bearer ${superadminToken}` });

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(studentEmail);
  });

  it("should not allow duplicate email or admission number", async () => {
    const res = await request(app)
      .post("/api/v1/students/create")
      .send({
        firstName: "Jane",
        lastName: "Smith",
        email: studentEmail,
        admissionNumber,
        classroomId,
        schoolId,
      })
      .set({ Authorization: `Bearer ${superadminToken}` });

    expect(res.body.success).toBe(false);
  });

  it("should list students", async () => {
    const res = await request(app)
      .get("/api/v1/students/list")
      .query({ classroomId })
      .set({ Authorization: `Bearer ${superadminToken}` });

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.students)).toBe(true);
  });
});
