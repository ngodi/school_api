import { errorHandler } from "../../errors/errorHandler";

export default class ApiHandler {
  constructor({ config, mwsRepo, managers, prop }) {
    this.config = config;
    this.mwsRepo = mwsRepo || {};
    this.managers = managers;
    this.prop = prop;
    this.methodMatrix = {};
    this.mwsStack = {};
    this.mw = this.mw.bind(this);
    this._buildMethodMatrix();
  }

  _buildMethodMatrix() {
    Object.keys(this.managers).forEach((mk) => {
      const manager = this.managers[mk];
      if (!manager || !manager[this.prop]) return;

      manager[this.prop].forEach((entry) => {
        const [methodAndFn, ...explicitMws] = entry.split("|");
        let method = "post";
        let fnName = methodAndFn;

        if (methodAndFn.includes("=")) {
          [method, fnName] = methodAndFn.split("=");
          method = method.toLowerCase();
        } else {
          // Built-in name→method mappings for common conventions
          if (fnName === "list") method = "get";
          if (fnName === "get") method = "get";
          if (fnName === "create") method = "post";
          if (fnName === "update") method = "put";
          if (fnName === "remove") method = "delete";
          if (fnName === "transfer") method = "post";
        }

        // Validate the function actually exists on the manager
        if (!manager[fnName]) {
          throw new Error(
            `[ApiHandler] Function "${fnName}" not found on manager "${mk}". ` +
              `Check that httpExposed entries match actual method names.`,
          );
        }

        // Register in method matrix
        if (!this.methodMatrix[mk]) this.methodMatrix[mk] = {};
        if (!this.methodMatrix[mk][method]) this.methodMatrix[mk][method] = [];
        this.methodMatrix[mk][method].push(fnName);

        // Register explicit middleware stack
        const key = `${mk}.${fnName}`;
        this.mwsStack[key] = [];

        explicitMws.forEach((mwName) => {
          if (!this.mwsRepo[mwName]) {
            throw new Error(
              `[ApiHandler] Middleware "${mwName}" declared for "${mk}.${fnName}" ` +
                `but not found in mwsRepo. Check your mws/ filenames.`,
            );
          }
          this.mwsStack[key].push(mwName);
        });
      });
    });
  }

  async _exec({ targetModule, fnName, data }) {
    try {
      return await targetModule[fnName](data);
    } catch (err) {
      return errorHandler(err);
    }
  }

  async mw(req, res) {
    const method = req.method.toLowerCase();
    const moduleName = req.params.moduleName;
    const fnName = req.params.fnName;
    const moduleMatrix = this.methodMatrix[moduleName];

    if (!moduleMatrix) {
      return res.status(404).json({
        success: false,
        message: `Module "${moduleName}" not found`,
      });
    }
    if (!moduleMatrix[method]) {
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} not supported on "${moduleName}"`,
      });
    }
    if (!moduleMatrix[method].includes(fnName)) {
      return res.status(404).json({
        success: false,
        message: `Function "${fnName}" not found on module "${moduleName}"`,
      });
    }

    // Build request data — token extracted here, available to middleware as data.token
    let data = {
      ...req.body,
      ...req.query,
      token: req.headers.authorization?.replace("Bearer ", "") ?? null,
    };

    // Run middleware stack — short-circuit immediately on first failure
    const mwStack = this.mwsStack[`${moduleName}.${fnName}`] || [];
    for (const mwName of mwStack) {
      const mwFn = this.mwsRepo[mwName];
      const result = await mwFn(data);
      if (!result.success) {
        return res
          .status(result.code || 400)
          .json({ success: false, message: result.message });
      }

      data = result.data;
    }

    const targetModule = this.managers[moduleName];
    const result = await this._exec({ targetModule, fnName, data });
    this.managers.responseDispatcher.dispatch(res, result);
  }
}
