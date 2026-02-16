import fs from "fs";
import path from "path";
import ApiHandler from "../managers/api/Api.manager.js";
import SchoolManager from "../managers/school/School.manager.js";
import UserManager from "../managers/user/User.manager.js";
import { fileURLToPath } from "url";

export default class ManagersLoader {
  constructor({ config, mwsRepo }) {
    this.config = config || {};
    this.mwsRepo = mwsRepo || {};
    this.managers = {};
  }

  load() {
    // Register managers
    this.managers.school = new SchoolManager();
    this.managers.user = UserManager;
    this.managers.classroom = (await import("../managers/school/Classroom.manager.js")).default;
    // Add more managers as needed
    // ...
    // API handler
    this.managers.api = new ApiHandler({
      config: this.config,
      mwsRepo: this.mwsRepo,
      managers: this.managers,
      prop: "httpExposed",
    });
    return this.managers;
  }
}
