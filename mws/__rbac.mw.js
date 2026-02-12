export default function rbacMiddleware(requiredRole) {
  return async function __rbac(data) {
    const user = data.user;
    if (!user) {
      return { ok: false, error: "User not authenticated" };
    }
    if (user.role !== requiredRole) {
      return { ok: false, error: `Access denied: ${requiredRole} only` };
    }
    return { ok: true, data };
  };
}
