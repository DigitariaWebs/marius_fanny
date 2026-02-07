/**
 * User role constants and utilities
 */

export const USER_ROLES = {
  USER: "user",
  STAFF: "staff",
  CUSTOMER_SERVICE: "customerService",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Role hierarchy levels (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  staff: 2,
  customerService: 3,
  admin: 4,
};

/**
 * Check if a role has sufficient permissions (equal or higher level)
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns true if user has sufficient permissions
 */
export function hasRolePermission(
  userRole: string,
  requiredRole: UserRole,
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Check if a role has any of the specified roles
 * @param userRole - The user's current role
 * @param allowedRoles - Array of allowed roles
 * @returns true if user has one of the allowed roles
 */
export function hasAnyRole(
  userRole: string,
  allowedRoles: UserRole[],
): boolean {
  return allowedRoles.some((role) => hasRolePermission(userRole, role));
}

/**
 * Get all roles that are equal or lower than the given role
 * @param role - The role to check
 * @returns Array of roles with equal or lower permissions
 */
export function getRolesAtOrBelow(role: UserRole): UserRole[] {
  const roleLevel = ROLE_HIERARCHY[role];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level <= roleLevel)
    .map(([roleName]) => roleName as UserRole);
}

/**
 * Get all roles that are higher than the given role
 * @param role - The role to check
 * @returns Array of roles with higher permissions
 */
export function getRolesAbove(role: UserRole): UserRole[] {
  const roleLevel = ROLE_HIERARCHY[role];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level > roleLevel)
    .map(([roleName]) => roleName as UserRole);
}

/**
 * Check if a user can manage another user based on roles
 * A user can manage users with equal or lower roles
 * @param managerRole - The role of the user trying to manage
 * @param targetRole - The role of the user being managed
 * @returns true if manager can manage target
 */
export function canManageUser(
  managerRole: string,
  targetRole: string,
): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole as UserRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole as UserRole] || 0;
  return managerLevel >= targetLevel;
}

/**
 * Get the role level number
 * @param role - The role to check
 * @returns The hierarchy level of the role
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as UserRole] || 0;
}

/**
 * Check if a role is valid
 * @param role - The role to validate
 * @returns true if the role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return role in ROLE_HIERARCHY;
}

/**
 * Get role display name
 * @param role - The role to format
 * @returns Formatted role name for display
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    user: "User",
    staff: "Staff",
    customerService: "Customer Service",
    admin: "Administrator",
  };
  return displayNames[role] || role;
}

/**
 * Get role description
 * @param role - The role to describe
 * @returns Description of the role's permissions
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    user: "Basic user with standard access permissions",
    staff: "Staff member with enhanced access for operational tasks",
    customerService:
      "Customer service representative with support and management capabilities",
    admin: "Full system administrator with complete access and control",
  };
  return descriptions[role] || "Unknown role";
}
