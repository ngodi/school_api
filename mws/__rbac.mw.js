export default function rbacMiddleware(requiredRoles) {
  return async function __rbac(data) {
    const user = data.user;
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    if (!requiredRoles.includes(user.role)) {
      return {
        success: false,
        message: `Access denied: ${requiredRoles.join(", ")} only`,
      };
    }
    return { success: true, data };
  };
}
