import { Roles } from '@prisma/client';

/**
 * Transform plain string role to Prisma enum Roles
 * @param role string input ("ADMIN", "USER", etc)
 * @returns Roles enum
 */
export function transformRoleToEnumRole(role: string): Roles {
  if (role && role.toUpperCase() === "ADMIN") {
    return Roles.ADMIN;
  }
  return Roles.USER;
}

/**
 * Get user object from Express JWT middleware
 */
export function getUserFromJWT(req: any) {
  return req.user;
}
