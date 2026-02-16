# School Management System API

A multi-tenant RESTful School Management System built with Node.js and MongoDB.

This API enables superadmins to manage schools globally and school administrators to manage resources within their assigned schools. The system enforces strict tenant isolation and role-based access control (RBAC).

---

# Project Overview

This project provides:

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Multi-tenant school isolation
- Classroom management
- Student enrollment and transfer capabilities
- Secure and scalable NoSQL schema design
- Input validation and centralized error handling

---

# Roles & Permissions

## Superadmin

- Full system access
- Create, update, delete schools
- Create school administrators
- View all schools and related data

## School Administrator

- Limited to their assigned school
- Manage classrooms
- Manage students
- Transfer students
- Cannot access other schools' data

---

# Business Rules & Constraints

### One School Admin Per School

- Each school admin manages exactly one School.
- Enforced at the db and application level.

### Classroom Rules

Each classroom:

- Has fixed capacity.
- Has a fixed list of courses.
- Belongs to exactly one school.
- Cannot exceed its defined student capacity.

### Student Rules

Each student:

- Belongs to one school.
- Is assigned to one classroom at a time.
- Has unique email per school.
- Can be transferred between classrooms.
- Can be transferred between schools.

---

# Database Schema

## Users Collection

```json
{
  "_id": "ObjectId",
  "email": "String",
  "firstName": "string",
  "lastName": "string",
  "passwordHash": "String",
  "role": "superadmin | school_admin",
  "schoolId": "ObjectId | null",
  "isActive": "Boolean",
  "createdAt": "Date"
}
```

## Schools Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "address": "String",
  "contactEmail": "String",
  "phone": "String",
  "createdBy": "ObjectId",
  "createdAt": "Date"
}
```

## Classrooms Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "capacity": "Number",
  "resources": ["String"],
  "courses": ["String"],
  "schoolId": "ObjectId",
  "createdAt": "Date"
}
```

## Students Collection

```json
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String",
  "email": "String",
  "classroomId": "ObjectId",
  "schoolId": "ObjectId",
  "enrollmentDate": "Date",
  "status": "active | inactive",
  "createdAt": "Date"
}
```

# Authentication & Authorization

```json
{
  "sub": "userId",
  "role": "schooladmin",
  "schoolId": "abc123"
}
```

# API Endpoints Overview

API_DOCUMENTATION_URL=http://localhost:5000/api/v1/api-docs

API_BASE_PATH=/api/v1

## Authentication

| Method | Endpoint     |
| ------ | ------------ |
| POST   | /auth/login  |
| POST   | /auth/logout |

## Users

| Method | Endpoint   |
| ------ | ---------- |
| POST   | /users     |
| GET    | /users     |
| GET    | /users/:id |

## Schools

| Method | Endpoint     |
| ------ | ------------ |
| POST   | /schools     |
| GET    | /schools     |
| GET    | /schools/:id |
| PATCH  | /schools/:id |
| DELETE | /schools/:id |

## Classrooms

| Method | Endpoint                      |
| ------ | ----------------------------- |
| POST   | /schools/:schoolId/classrooms |
| GET    | /schools/:schoolId/classrooms |
| GET    | /classrooms/:id               |
| PATCH  | /classrooms/:id               |
| DELETE | /classrooms/:id               |

```json
Restrictions:

Classroom names must be unique per school.

Student count must not exceed capacity.
```

## Students

| Method | Endpoint                    |
| ------ | --------------------------- |
| POST   | /schools/:schoolId/students |
| GET    | /schools/:schoolId/students |
| GET    | /students/:id               |
| PATCH  | /students/:id               |
| DELETE | /students/:id               |
| PATCH  | /students/:id/transfer      |

```json
Restrictions:

Email must be unique within school.

Classroom must belong to school.

Capacity must be validated before enrollment.

Transfers must update both schoolId and classroomId.
```

# Security Measures

- Password hashing using bcrypt
- JWT expiration (15 minutes recommended)
- Refresh token support
- Rate limiting on authentication routes
- Helmet middleware for security headers
- CORS configuration
- Strict school-based query filtering
- Unique database indexes

## Rate Limiting

- Gloabl rate-limiting
  100 requests per 15 minutes per IP

# Installation Guide

## Clone Repository

git clone <repository-url>
cd school-management-api

## Install Dependencies

npm install

## Configure Environment

Create a .env file:

- PORT=5000
- NODE_ENV=development
- MONGO_URI=mongodb://localhost:27017/school_management_api
- JWT_SECRET=your_jwt_secret_key
- JWT_EXPIRES_IN=1d
- SUPERADMIN_EMAIL=your super admin email
- REDIS_URL=your redis url
- SUPERADMIN_PASSWORD= your admin password
- SUPERADMIN_FIRST_NAME=Super
- SUPERADMIN_LAST_NAME=Admin
- CLIENT_URL=http://localhost:3000
- ALLOWED_ORIGINS=http://localhost:3000

## Start MongoDB

If installed locally:

sudo systemctl start mongod

## Run Application

npm run start

## Seed super Admin

npm run seed:superadmin

# Deployment Guide

## Production Recommendations

- Use MongoDB Atlas or managed MongoDB service
- Enable MongoDB authentication
- Store secrets securely
- Enable monitoring and logging

# Future Improvements & Enhancements

- Add Teacher entity
- Add Subscription entity
- Add Exam and Tests
- Add Student Attendance
- Add Fees Payments
- Separate Course collection instead of string arrays
- Soft deletes (deletedAt)
- Audit logging
- Redis caching layer
- Per resource/route rate-limiter
