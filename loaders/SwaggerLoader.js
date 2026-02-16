import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import config from "../config.js";

const swaggerSpec = YAML.load(path.resolve(process.cwd(), "openapi.yaml"));

swaggerSpec.servers = [
  {
    url: config.API_URL || "http://localhost:5000",
    description: config.API_URL ? "Production (Railway)" : "Local development",
  },
];

export { swaggerUi, swaggerSpec };
