export default function rbacMiddleware(requiredRoles) {
  return function __rbac(data) {
    const user = data.user;
    if (!user) {
      return { success: false, message: "User not authenticated", code: 401 };
    }

    if (!requiredRoles.includes(user.role)) {
      return {
        success: false,
        message: `Access denied: ${requiredRoles.join(", ")} only`,
        code: 403,
      };
    }
    return { success: true, data, code: 200 };
  };
}
