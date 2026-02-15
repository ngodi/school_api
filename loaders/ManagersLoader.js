import ApiHandler from "../managers/api/Api.manager.js";
import SchoolManager from "../managers/schools/School.manager.js";
import SchoolServer from "../managers/http/SchoolServer.manager.js";
import UserManager from "../managers/users/User.manager.js";
import ClassroomManager from "../managers/classrooms/Classroom.manager.js";
import StudentManager from "../managers/students/Student.manager.js";

import VirtualStack from "../managers/virtual_stack/VirtualStack.manager.js";
import ResponseDispatcher from "../managers/response_dispatcher/ResponseDispatcher.manager.js";
import HealthManager from "../managers/health/Health.manager.js";
import MiddlewaresLoader from "./MiddlewaresLoader.js";
import connectWithRetry from "./MongooseLoader.js";
import { connectRedisWithRetry } from "./RedisLoader.js";

export default class ManagersLoader {
  constructor({ config, mwsRepo }) {
    this.config = config || {};
    this.mwsRepo = mwsRepo || {};
    this.managers = {};

    this.injectable = {
      config: this.config,
      mwsRepo: this.mwsRepo,
      managers: this.managers,
    };
  }

  async load() {
    // load middlewares
    const middlewaresLoader = new MiddlewaresLoader(this.injectable);
    this.mwsRepo = await middlewaresLoader.load();

    // injectable mws
    this.injectable.mwsRepo = this.mwsRepo;

    // Register managers
    this.managers.responseDispatcher = new ResponseDispatcher();
    this.managers.health = new HealthManager(this.injectable);
    this.managers.mwsExec = new VirtualStack({ mwsRepo: this.mwsRepo });

    this.managers.schools = new SchoolManager({
      config: this.config,
      mwsRepo: this.mwsRepo,
    });

    this.managers.users = UserManager;
    this.managers.classrooms = ClassroomManager;
    this.managers.students = StudentManager;
    // ...
    // API handler
    this.managers.schoolApi = new ApiHandler({
      ...this.injectable,
      prop: "httpExposed",
    });

    this.managers.schoolServer = new SchoolServer({
      config: this.config,
      managers: this.managers,
    });

    this.managers.mongoose = await connectWithRetry();
    this.managers.redis = await connectRedisWithRetry();

    return this.managers;
  }
}
