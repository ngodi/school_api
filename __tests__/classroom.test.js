import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { app, server } from "../index.js";
import User from "../managers/users/User.model.js";
import School from "../managers/schools/School.model.js";

describe("Classroom Endpoints", () => {
  let superadminToken;
  let schoolId;
  let superadminId;
  const password = "Password123!";
  const classroomCode = `A${Date.now()}`;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();

    // Create superadmin
    const superadmin = new User({
      email: `superadmin_${Date.now()}@classroom.com`,
      passwordHash: await bcrypt.hash(password, 10),
      role: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      phone: "1234567890",
    });
    await superadmin.save();
    superadminId = superadmin._id;

    // Login superadmin
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: superadmin.email, password });

    superadminToken = res.body.data.token;

    // Create school
    const school = new School({
      name: `Test School ${Date.now()}`,
      address: "123 Main St",
      contactEmail: "school@example.com",
      phone: "1234567890",
      createdBy: superadminId,
    });
    await school.save();
    schoolId = school._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    await new Promise((resolve) => server.close(resolve));
  });

  it("should create a classroom by superadmin", async () => {
    const res = await request(app)
      .post("/api/v1/classrooms/create")
      .send({
        name: "Class A",
        code: classroomCode,
        schoolId,
        createdBy: superadminId,
      })
      .set("Authorization", `Bearer ${superadminToken}`);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Class A");
  });

  it("should not allow duplicate classroom code in same school", async () => {
    const res = await request(app)
      .post("/api/v1/classrooms/create")
      .send({
        name: "Class B",
        code: classroomCode,
        schoolId,
      })
      .set("Authorization", `Bearer ${superadminToken}`);

    expect(res.body.success).toBe(false);
  });

  it("should list classrooms", async () => {
    const res = await request(app)
      .get("/api/v1/classrooms/list")
      .query({ schoolId: schoolId.toString(), page: 1, limit: 10 })
      .set("Authorization", `Bearer ${superadminToken}`);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.classrooms)).toBe(true);
  });
});
