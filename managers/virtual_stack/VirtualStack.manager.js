import Bolt from "./Bolt.manager.js";

class VirtualStack {
  constructor({ mwsRepo, preStack } = {}) {
    this.mwsRepo = mwsRepo || {};
    this.preStack = preStack || [];
  }

  createBolt(args) {
    args.stack = (args.stack || []).concat([]);
    args.stack = this.preStack.concat(args.stack);
    return new Bolt({ ...{ mwsRepo: this.mwsRepo }, ...args });
  }
}

export default VirtualStack;
