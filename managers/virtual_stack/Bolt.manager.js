class StackBolt {
  constructor({ mwsRepo, stack } = {}) {
    this.mwsRepo = mwsRepo || {};
    this.stack = stack || [];
  }

  async execute(data) {
    let result = { success: true, data };

    for (const mwName of this.stack) {
      if (!this.mwsRepo[mwName]) {
        result.error = `Middleware ${mwName} not found`;
        result.success = false;
        break;
      }

      const mw = this.mwsRepo[mwName];
      result = await mw(result.data || data);

      if (!result.ok) {
        break;
      }

      data = result.data || data;
    }

    return result;
  }
}

export default StackBolt;
