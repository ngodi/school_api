function getParamNames(fn) {
  const fnStr = fn.toString().replace(/\/\//g, " ");
  const args = fnStr.match(/^[\s\S]*?\(([^)]*)\)/);
  if (!args) return "";
  return args[1]
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .join(",");
}

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
      if (manager && manager[this.prop]) {
        this.methodMatrix[mk] = this.methodMatrix[mk] || {};
        manager[this.prop].forEach((fnName) => {
          let method = "post";
          // Map RESTful function names to HTTP methods
          if (fnName === "list") method = "get";
          if (fnName === "get") method = "get";
          if (fnName === "create") method = "post";
          if (fnName === "update") method = "put";
          if (fnName === "remove") method = "delete";
          if (!this.methodMatrix[mk][method]) {
            this.methodMatrix[mk][method] = [];
          }
          this.methodMatrix[mk][method].push(fnName);
          const fn = manager[fnName];
          const params = getParamNames(fn)
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
          params.forEach((param) => {
            if (param.startsWith("__")) {
              if (!this.mwsRepo[param]) {
                throw Error(`Middleware ${param} not found`);
              }
              if (!this.mwsStack[`${mk}.${fnName}`]) {
                this.mwsStack[`${mk}.${fnName}`] = [];
              }
              this.mwsStack[`${mk}.${fnName}`].push(param);
            }
          });
        });
      }
    });
  }

  async _exec({ targetModule, fnName, data }) {
    try {
      return await targetModule[fnName](data);
    } catch (err) {
      return { error: `${fnName} failed: ${err.message}` };
    }
  }

  async mw(req, res) {
    const method = req.method.toLowerCase();
    const moduleName = req.params.moduleName;
    const fnName = req.params.fnName;
    const moduleMatrix = this.methodMatrix[moduleName];
    if (!moduleMatrix) {
      return res
        .status(404)
        .json({ ok: false, message: `Module ${moduleName} not found` });
    }
    if (!moduleMatrix[method]) {
      return res
        .status(405)
        .json({ ok: false, message: `Unsupported method ${method}` });
    }
    if (!moduleMatrix[method].includes(fnName)) {
      return res
        .status(404)
        .json({
          ok: false,
          message: `Function ${fnName} not found in module ${moduleName}`,
        });
    }
    const mwStack = this.mwsStack[`${moduleName}.${fnName}`] || [];
    let data = { ...req.body };
    for (const mwName of mwStack) {
      const mw = this.mwsRepo[mwName];
      const result = await mw(data);
      if (!result.ok) {
        return res.status(403).json({ ok: false, message: result.error });
      }
      data = result.data;
    }
    const targetModule = this.managers[moduleName];
    const result = await this._exec({ targetModule, fnName, data });
    res.json(result);
  }
}
