/**
 * @openapi
 * /api/v1/admin/classrooms:
 *   post:
 *     tags:
 *       - Admin
 *       - Classrooms
 *     summary: Create a classroom (schooladmin or superadmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               schoolId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Classroom created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *
 * /api/v1/admin/classrooms/{id}:
 *   get:
 *     tags:
 *       - Admin
 *       - Classrooms
 *     summary: Get classroom by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Classroom details
 *       404:
 *         description: Not found
 *   put:
 *     tags:
 *       - Admin
 *       - Classrooms
 *     summary: Update classroom by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Classroom updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 *   delete:
 *     tags:
 *       - Admin
 *       - Classrooms
 *     summary: Delete classroom by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Classroom deleted
 *       404:
 *         description: Not found
 *
 * /api/v1/admin/classrooms:
 *   get:
 *     tags:
 *       - Admin
 *       - Classrooms
 *     summary: List classrooms (optionally by school)
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of classrooms
 */
/**
 * @openapi
 * /api/v1/admin/users:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a user (school_admin) by superadmin or schooladmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [school_admin]
 *               schoolId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User logout
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
import express from "express";
import HealthManager from "./managers/health/Health.manager.js";
import { swaggerUi, swaggerSpec } from "./loaders/SwaggerLoader.js";
import connectWithRetry from "./loaders/MongooseLoader.js";
import { connectRedisWithRetry } from "./loaders/RedisLoader.js";
import ManagersLoader from "./loaders/ManagersLoader.js";
import MiddlewaresLoader from "./loaders/MiddlewaresLoader.js";
import errorHandler from "./mws/errorHandler.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8100;

async function bootstrap() {
  // Classroom CRUD endpoints
  app.post("/api/v1/admin/classrooms", (req, res) =>
    managers.api.mw(
      { ...req, params: { moduleName: "classroom", fnName: "create" } },
      res,
    ),
  );
  app.get("/api/v1/admin/classrooms/:id", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "classroom", fnName: "get" },
        body: { ...req.body, id: req.params.id },
      },
      res,
    ),
  );
  app.put("/api/v1/admin/classrooms/:id", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "classroom", fnName: "update" },
        body: { ...req.body, id: req.params.id },
      },
      res,
    ),
  );
  app.delete("/api/v1/admin/classrooms/:id", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "classroom", fnName: "remove" },
        body: { ...req.body, id: req.params.id },
      },
      res,
    ),
  );
  app.get("/api/v1/admin/classrooms", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "classroom", fnName: "list" },
        body: { ...req.body, schoolId: req.query.schoolId },
      },
      res,
    ),
  );
  const mwsLoader = new MiddlewaresLoader();
  const mwsRepo = await mwsLoader.load();
  const managersLoader = new ManagersLoader({ mwsRepo });
  const managers = managersLoader.load();

  // Admin-only School routes
  // User management endpoint (single route)
  app.post("/api/v1/admin/users", (req, res) =>
    managers.api.mw(
      { ...req, params: { moduleName: "user", fnName: "createUser" } },
      res,
    ),
  );
  app.post("/api/v1/auth/login", (req, res) =>
    managers.api.mw(
      { ...req, params: { moduleName: "user", fnName: "login" } },
      res,
    ),
  );
  app.post("/api/v1/auth/logout", (req, res) =>
    managers.api.mw(
      { ...req, params: { moduleName: "user", fnName: "logout" } },
      res,
    ),
  );
  app.post("/api/v1/admin/schools", (req, res) =>
    managers.api.mw(
      { ...req, params: { moduleName: "school", fnName: "create" } },
      res,
    ),
  );
  app.put("/api/v1/admin/schools/:id", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "school", fnName: "update" },
        body: { ...req.body, id: req.params.id },
      },
      res,
    ),
  );
  app.delete("/api/v1/admin/schools/:id", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "school", fnName: "remove" },
        body: { ...req.body, id: req.params.id },
      },
      res,
    ),
  );

  // General School routes
  app.get("/api/v1/schools", (req, res) =>
    managers.api.mw(
      { ...req, params: { moduleName: "school", fnName: "list" } },
      res,
    ),
  );
  app.get("/api/v1/schools/:id", (req, res) =>
    managers.api.mw(
      {
        ...req,
        params: { moduleName: "school", fnName: "get" },
        body: { ...req.body, id: req.params.id },
      },
      res,
    ),
  );

  // Legacy manager pattern API endpoint
  app.post("/api/:moduleName/:fnName", managers.api.mw);
  // Swagger API docs
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Error handler
  app.use(errorHandler());
}

// Connect to MongoDB and Redis
connectWithRetry();
connectRedisWithRetry();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns API health status
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get("/health", (req, res) => HealthManager.handle(req, res));

bootstrap().then(() => {
  app.listen(port, () => {
    console.log(`School Management API listening on port ${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
  });
});

export default app;
