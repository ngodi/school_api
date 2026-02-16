# School Management API

A multi-tenant RESTful API for managing schools, classrooms, and students — built with Node.js, Express, and MongoDB.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.0-red)](https://redis.io)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## Overview

This API enables superadmins to manage schools globally and school administrators to manage resources within their assigned schools. The system enforces strict tenant isolation, role-based access control, and provides a complete audit trail for student transfers.

**Live API Docs:** [https://schoolapi-production-04b4.up.railway.app/api/v1/api-docs](https://schoolapi-production-04b4.up.railway.app/api/v1/api-docs)

---

## Features

- JWT-based authentication with token blacklisting
- Role-based access control (RBAC) — superadmin and schooladmin roles
- Multi-tenant school isolation — schooladmins can only access their own school's data
- Classroom and student management with capacity enforcement
- Student transfer between schools and classrooms with full audit history
- Centralised error handling with custom error classes
- Input validation via Zod middleware
- Global rate limiting
- Swagger / OpenAPI documentation
- Automated test suite with Jest and Supertest

---

## Tech Stack

| Layer                   | Technology                      |
| ----------------------- | ------------------------------- |
| Runtime                 | Node.js 18+                     |
| Framework               | Express.js                      |
| Database                | MongoDB + Mongoose ODM          |
| Cache / Token blacklist | Redis (node-redis)              |
| Authentication          | JSON Web Tokens (jsonwebtoken)  |
| Password hashing        | bcrypt                          |
| Validation              | Zod                             |
| API documentation       | Swagger UI + YAML (openapi 3.0) |
| Testing                 | Jest + Supertest                |
| In-memory test DB       | mongodb-memory-server           |
| Rate limiting           | express-rate-limit              |
| Process management      | Nodemon (dev)                   |
| Deployment              | Railway                         |

---

## Roles & Permissions

### Superadmin

- Full system access
- Create, update, and delete schools
- Create school administrators
- View all schools and related data

### School Administrator

- Scoped to their assigned school only
- Manage classrooms and students within their school
- Initiate and receive student transfers
- Cannot access other schools' data

---

## Architecture

The API uses a custom middleware pipeline called **VirtualStack**. Each route handler declares its required middleware inline in `httpExposed`:

```js
this.httpExposed = [
  "post=create|__auth|__rbac_superadmin|__validateCreateSchool",
  "get=getSchool|__auth",
  "delete=remove|__auth|__rbac_superadmin",
];
```

`ApiHandler` reads these declarations at startup, builds a middleware stack per route, and short-circuits with the appropriate error response if any middleware fails — before the handler is ever called.

---

## Database Schema

<details>
<summary>Users</summary>

```json
{
  "_id": "ObjectId",
  "email": "String (unique)",
  "firstName": "String",
  "lastName": "String",
  "passwordHash": "String",
  "role": "superadmin | schooladmin",
  "schoolId": "ObjectId | null",
  "isActive": "Boolean",
  "createdAt": "Date"
}
```

</details>

<details>
<summary>Schools</summary>

```json
{
  "_id": "ObjectId",
  "name": "String (unique)",
  "address": "String",
  "contactEmail": "String",
  "phone": "String",
  "createdBy": "ObjectId",
  "createdAt": "Date"
}
```

</details>

<details>
<summary>Classrooms</summary>

```json
{
  "_id": "ObjectId",
  "name": "String",
  "code": "String (unique)",
  "capacity": "Number",
  "courses": ["String"],
  "schoolId": "ObjectId",
  "createdBy": "ObjectId",
  "createdAt": "Date"
}
```

</details>

<details>
<summary>Students</summary>

```json
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String",
  "email": "String (unique)",
  "admissionNumber": "String (auto-generated)",
  "classroomId": "ObjectId",
  "schoolId": "ObjectId",
  "enrollmentDate": "Date",
  "status": "active | transferred",
  "createdAt": "Date"
}
```

</details>

<details>
<summary>Student Transfers</summary>

```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId",
  "fromSchoolId": "ObjectId",
  "fromClassroomId": "ObjectId",
  "toSchoolId": "ObjectId",
  "toClassroomId": "ObjectId",
  "transferredBy": "ObjectId",
  "reason": "String | null",
  "status": "pending | completed | cancelled",
  "transferredAt": "Date"
}
```

</details>

---

## API Endpoints

Base path: `/api/v1`

### Authentication

| Method | Endpoint        | Auth | Description           |
| ------ | --------------- | ---- | --------------------- |
| POST   | `/users/login`  | —    | Login and receive JWT |
| POST   | `/users/logout` | ✅   | Blacklist token       |

### Users

| Method | Endpoint         | Auth       | Description          |
| ------ | ---------------- | ---------- | -------------------- |
| POST   | `/users/create`  | Superadmin | Create a schooladmin |
| GET    | `/users/list`    | Superadmin | List all users       |
| GET    | `/users/getUser` | ✅         | Get user by id       |
| PUT    | `/users/update`  | ✅         | Update user          |

### Schools

| Method | Endpoint             | Auth       | Description      |
| ------ | -------------------- | ---------- | ---------------- |
| POST   | `/schools/create`    | Superadmin | Create a school  |
| GET    | `/schools/list`      | ✅         | List all schools |
| GET    | `/schools/getSchool` | ✅         | Get school by id |
| PUT    | `/schools/update`    | Superadmin | Update school    |
| DELETE | `/schools/remove`    | Superadmin | Delete school    |

### Classrooms

| Method | Endpoint                   | Auth       | Description         |
| ------ | -------------------------- | ---------- | ------------------- |
| POST   | `/classrooms/create`       | Superadmin | Create a classroom  |
| GET    | `/classrooms/list`         | ✅         | List classrooms     |
| GET    | `/classrooms/getClassroom` | ✅         | Get classroom by id |
| PUT    | `/classrooms/update`       | Superadmin | Update classroom    |
| DELETE | `/classrooms/remove`       | Superadmin | Delete classroom    |

### Students

| Method | Endpoint               | Auth         | Description       |
| ------ | ---------------------- | ------------ | ----------------- |
| POST   | `/students/create`     | ✅           | Enroll a student  |
| GET    | `/students/list`       | ✅           | List students     |
| GET    | `/students/getStudent` | ✅           | Get student by id |
| PUT    | `/students/update`     | ✅           | Update student    |
| DELETE | `/students/remove`     | Superadmin   | Delete student    |
| POST   | `/students/transfer`   | School Admin | Transfer student  |

---

## Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT tokens expire in **1 day** (configurable via `JWT_EXPIRES_IN`)
- Logged-out tokens blacklisted in **Redis**
- **Helmet** middleware for HTTP security headers
- **CORS** restricted to `ALLOWED_ORIGINS`
- Global rate limit: **100 requests per 15 minutes per IP**
- Strict school-based query filtering on all schooladmin requests
- Unique database indexes on email, admission number, classroom code

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Redis 7.0+

### Installation

```bash
git clone <repository-url>
cd school-management-api
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/school_management_api

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Superadmin seed
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=your_secure_password
SUPERADMIN_FIRST_NAME=Super
SUPERADMIN_LAST_NAME=Admin

# Server
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

### Start MongoDB (local)

```bash
sudo systemctl start mongod
```

### Seed Superadmin

```bash
npm run seed:superadmin
```

### Run in Development

```bash
npm run start
```

### Run Tests

```bash
npm run test
```

---

## Testing

The test suite uses **Jest** and **Supertest** against a real Express app instance. MongoDB is provided by **mongodb-memory-server** (no external database required for tests). Redis is mocked via **ioredis-mock**.

Test files are located in `__tests__/` and cover:

- Authentication (login, logout, token blacklisting)
- User CRUD with role checks
- School CRUD with auth enforcement
- Classroom CRUD with school isolation
- Student enrollment and CRUD
- Student transfer — including RBAC, invalid classroom/school, and full history verification

```bash
# Run all tests
npm run test

# Run a specific suite
npx jest __tests__/school.test.js
```

---

## Deployment

This API is deployed on **Railway**. Recommended production setup:

- **MongoDB:** MongoDB Atlas (M0 free tier or above)
- **Redis:** Railway Redis plugin or Redis Cloud
- Set all `.env` variables in Railway → your service → **Variables**
- Set `API_URL` to your Railway public domain for Swagger to work correctly
- Use the **internal Railway URL** for Redis (`redis.railway.internal:6379`) to avoid public network latency

---

## Future Improvements

- [ ] Teacher entity and assignment to classrooms
- [ ] Exam and test management
- [ ] Student attendance tracking
- [ ] Fees and payments
- [ ] Separate Course collection (replacing string arrays)
- [ ] Subscription / billing entity
- [ ] Soft deletes (`deletedAt` field)
- [ ] Audit logging for all mutations
- [ ] Redis caching layer for frequently read data
- [ ] Per-route rate limiting
- [ ] Refresh token support

---

## License

MIT
