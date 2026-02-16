import ManagersLoader from "./loaders/ManagersLoader.js";
import config from "./config.js";

export let app;
export let server;

async function bootstrap() {
  const managersLoader = new ManagersLoader({ config });
  const managers = await managersLoader.load();

  app = managers.schoolServer.configure();
  server = managers.schoolServer.run();
}

bootstrap();
