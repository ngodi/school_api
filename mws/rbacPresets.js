import rbacMiddleware from "../mws/__rbac.mw.js";

export const superadminOnly = rbacMiddleware("superadmin");
export const schoolAdminOnly = rbacMiddleware("school_admin");
