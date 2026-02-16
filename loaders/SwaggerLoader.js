import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const swaggerSpec = YAML.load(path.resolve(process.cwd(), "openapi.yaml"));

export { swaggerUi, swaggerSpec };
