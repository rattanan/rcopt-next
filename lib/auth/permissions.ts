export type AdminPermission = "dashboard:read" | "content:read" | "content:write" | "banner:read" | "banner:write";
export function hasAdminPermission(isSuperuser: boolean, permission: AdminPermission): boolean { void permission; return isSuperuser; }
