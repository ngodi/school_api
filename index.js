import ManagersLoader from "./loaders/ManagersLoader.js";
import config from "./config.js";

async function bootstrap() {
  const managersLoader = new ManagersLoader({ config });
  const managers = await managersLoader.load();

  managers.schoolServer.run();
}

bootstrap();
