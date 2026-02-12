import express from "express";
import HealthManager from "./managers/health/Health.manager.js";
import { swaggerUi, swaggerSpec } from "./loaders/SwaggerLoader.js";

const app = express();
const port = process.env.PORT || 5000;

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.listen(port, () => {
  console.log(`School Management API listening on port ${port}`);
});
