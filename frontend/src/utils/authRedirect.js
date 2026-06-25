export const dashboardByRole = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  center_owner: '/dashboard/center',
  admin: '/dashboard/admin',
};

const AUTH_PATHS = new Set(['/login', '/register', '/get-started', '/']);

export const getPostAuthPath = (user, fromPath) => {
  if (!user?.role) {
    return '/get-started';
  }

  if (
    fromPath &&
    !AUTH_PATHS.has(fromPath) &&
    !fromPath.startsWith('/dashboard')
  ) {
    return fromPath;
  }

  return dashboardByRole[user.role] || '/get-started';
};
