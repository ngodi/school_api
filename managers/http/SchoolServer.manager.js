import express from "express";
import cors from "cors";
import { swaggerUi, swaggerSpec } from "../../loaders/SwaggerLoader.js";
import rateLimit from "express-rate-limit";

class SchoolServer {
  constructor({ config, managers }) {
    this.config = config || {};
    this.schoolApi = managers.schoolApi;
    this.managers = managers;
    this.app = express();
  }

  configure() {
    const app = this.app;

    // Global: 100 requests per 15 minutes per IP
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        success: false,
        message: "Too many requests, please try again later",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use(cors({ origin: this.config.ALLOWED_ORIGINS }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(globalLimiter);

    app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    app.all("/api/v1/:moduleName/:fnName", this.schoolApi.mw);

    app.use((req, res) => {
      res.status(404).json({ success: false, message: "Route not found" });
    });

    return app;
  }

  run() {
    const server = this.configure();
    const port = this.config.PORT || 5000;

    return server.listen(port, () => {
      console.log(
        `\nSchool Management API running and listening on port ${port}`,
      );
      console.log(`Swagger docs: http://localhost:${port}/api-docs\n`);
    });
  }
}

export default SchoolServer;
