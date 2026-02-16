import rbacMiddleware from "./__rbac.mw.js";

export default function RBAC() {
  return rbacMiddleware(["superadmin", "schooladmin"]);
}
