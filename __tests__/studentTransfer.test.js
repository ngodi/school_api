import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { app, server } from "../index.js";
import User from "../managers/users/User.model.js";
import School from "../managers/schools/School.model.js";
import Classroom from "../managers/classrooms/Classroom.model.js";
import Student from "../managers/students/Student.model.js";
import StudentTransfer from "../managers/students/StudentTransfer.model.js";

describe("Student Transfer", () => {
  const password = "Password123!";

  let superadminToken;
  let schoolAdminAToken;
  let schoolAdminBToken;

  let schoolA, schoolB;
  let classroomA, classroomB;
  let student;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();

    const superadmin = new User({
      email: `superadmin_${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash(password, 10),
      role: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      phone: "1234567890",
    });
    await superadmin.save();

    const superRes = await request(app)
      .post("/api/v1/users/login")
      .send({ email: superadmin.email, password });

    superadminToken = superRes.body.data.token;

    schoolA = new School({
      name: `School A ${Date.now()}`,
      address: "1 Alpha St",
      contactEmail: "a@school.com",
      phone: "1111111111",
      createdBy: superadmin._id,
    });
    await schoolA.save();

    schoolB = new School({
      name: `School B ${Date.now()}`,
      address: "2 Beta St",
      contactEmail: "b@school.com",
      phone: "2222222222",
      createdBy: superadmin._id,
    });
    await schoolB.save();

    const adminA = new User({
      email: `adminA_${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash(password, 10),
      role: "schooladmin",
      firstName: "Admin",
      lastName: "A",
      phone: "1234567891",
      schoolId: schoolA._id,
    });
    await adminA.save();

    const adminB = new User({
      email: `adminB_${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash(password, 10),
      role: "schooladmin",
      firstName: "Admin",
      lastName: "B",
      phone: "1234567892",
      schoolId: schoolB._id,
    });
    await adminB.save();

    const resA = await request(app)
      .post("/api/v1/users/login")
      .send({ email: adminA.email, password });

    schoolAdminAToken = resA.body.data.token;

    const resB = await request(app)
      .post("/api/v1/users/login")
      .send({ email: adminB.email, password });

    schoolAdminBToken = resB.body.data.token;

    classroomA = new Classroom({
      name: "Class A1",
      code: `CA${Date.now()}`,
      schoolId: schoolA._id,
      createdBy: superadmin._id,
    });

    await classroomA.save();

    classroomB = new Classroom({
      name: "Class B1",
      code: `CB${Date.now()}`,
      schoolId: schoolB._id,
      createdBy: superadmin._id,
    });

    await classroomB.save();

    student = new Student({
      firstName: "Jane",
      lastName: "Doe",
      email: `jane_${Date.now()}@student.com`,
      classroomId: classroomA._id,
      schoolId: schoolA._id,
    });

    await student.save();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  it("should fail without authentication", async () => {
    const res = await request(app).post("/api/v1/students/transfer").send({
      studentId: student._id,
      toSchoolId: schoolB._id,
      toClassroomId: classroomB._id,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should fail if classroom does not belong to destination school", async () => {
    const res = await request(app)
      .post("/api/v1/students/transfer")
      .set("Authorization", `Bearer ${superadminToken}`)
      .send({
        studentId: student._id.toString(),
        toSchoolId: schoolB._id.toString(),
        toClassroomId: classroomA._id.toString(), // classroomA belongs to schoolA, not schoolB
        reason: "Testing invalid classroom",
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("should fail if admin is unrelated to both schools", async () => {
    // adminB belongs to schoolB — student is in schoolA
    // transferring to a third unrelated school should be denied
    const thirdSchool = new School({
      name: `School C ${Date.now()}`,
      address: "3 Gamma St",
      contactEmail: "c@school.com",
      phone: "3333333333",
      createdBy: student._id, // just needs a valid ObjectId
    });

    await thirdSchool.save();

    const thirdClassroom = new Classroom({
      name: "Class C1",
      code: `CC${Date.now()}`,
      schoolId: thirdSchool._id,
      createdBy: student._id,
    });

    await thirdClassroom.save();

    const res = await request(app)
      .post("/api/v1/students/transfer")
      .set("Authorization", `Bearer ${schoolAdminBToken}`)
      .send({
        studentId: student._id.toString(),
        toSchoolId: thirdSchool._id.toString(),
        toClassroomId: thirdClassroom._id.toString(),
        reason: "Unauthorised transfer attempt",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should allow source school admin (adminA) to transfer student out", async () => {
    const res = await request(app)
      .post("/api/v1/students/transfer")
      .set("Authorization", `Bearer ${schoolAdminAToken}`)
      .send({
        studentId: student._id.toString(),
        toSchoolId: schoolB._id.toString(),
        toClassroomId: classroomB._id.toString(),
        reason: "Family relocation",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.schoolId.toString()).toBe(
      schoolB._id.toString(),
    );
    expect(res.body.data.student.classroomId.toString()).toBe(
      classroomB._id.toString(),
    );
    expect(res.body.data.student.status).toBe("transferred");

    // Verify transfer history was recorded
    const transferRecord = await StudentTransfer.findOne({
      studentId: student._id,
    });
    expect(transferRecord).not.toBeNull();
    expect(transferRecord.fromSchoolId.toString()).toBe(schoolA._id.toString());
    expect(transferRecord.toSchoolId.toString()).toBe(schoolB._id.toString());
    expect(transferRecord.reason).toBe("Family relocation");
  });

  it("should allow destination school admin (adminB) to transfer student into their school", async () => {
    // Student is now in schoolB — adminB can transfer them to a new classroom
    const newClassroomB = new Classroom({
      name: "Class B2",
      code: `CB2${Date.now()}`,
      schoolId: schoolB._id,
      createdBy: student._id,
    });
    await newClassroomB.save();

    const res = await request(app)
      .post("/api/v1/students/transfer")
      .set("Authorization", `Bearer ${schoolAdminBToken}`)
      .send({
        studentId: student._id.toString(),
        toSchoolId: schoolB._id.toString(),
        toClassroomId: newClassroomB._id.toString(),
        reason: "Internal classroom reassignment",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student.classroomId.toString()).toBe(
      newClassroomB._id.toString(),
    );
  });

  it("should have a full transfer history after multiple transfers", async () => {
    const transfers = await StudentTransfer.find({
      studentId: student._id,
    }).sort({ transferredAt: 1 });
    expect(transfers.length).toBe(2);
    expect(transfers[0].fromSchoolId.toString()).toBe(schoolA._id.toString());
    expect(transfers[1].fromSchoolId.toString()).toBe(schoolB._id.toString());
  });
});
