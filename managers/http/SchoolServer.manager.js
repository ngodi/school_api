import express from "express";
import cors from "cors";
import { swaggerUi, swaggerSpec } from "../../loaders/SwaggerLoader.js";
import errorHandler from "../../mws/errorHandler.js";

class SchoolServer {
  constructor({ config, managers }) {
    this.config = config || {};
    this.schoolApi = managers.schoolApi;
    this.managers = managers;
    this.app = express();
  }

  run() {
    const app = this.app;
    app.use(cors({ origin: "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Health check route
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // API route
    app.all("/api/v1/:moduleName/:fnName", this.schoolApi.mw);

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, message: "Route not found" });
    });

    app.use(errorHandler);

    const port = this.config.PORT || 5000;
    app.listen(port, () => {
      console.log(
        `\nSchool Management API running and listening on port ${port}`,
      );
      console.log(`Swagger docs: http://localhost:${port}/api-docs\n`);
    });
  }
}

export default SchoolServer;
