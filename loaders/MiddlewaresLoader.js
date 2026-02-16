import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default class MiddlewaresLoader {
  constructor(injectable) {
    this.injectable = injectable;
    this.mws = {};
  }

  async load() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mwsDir = path.resolve(__dirname, "../mws");
    if (!fs.existsSync(mwsDir)) return this.mws;
    const files = fs.readdirSync(mwsDir).filter((f) => f.endsWith(".mw.js"));
    for (const f of files) {
      const key = f.split(".").shift();
      const module = await import(path.join(mwsDir, f));
      const builder = module.default;
      this.mws[key] = builder(this.injectable);
    }
    return this.mws;
  }
}
