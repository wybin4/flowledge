import { IRole } from "@/types/Role";
import { CachedCollection } from "./CachedCollection";

export const Roles = new CachedCollection<IRole>('roles');

// export const Roles = Application.addCollection<IRole>('roles');

// export function setRole(role: IRole) {
//     Roles.insertOne(role);
// }

// export function getRole(name: string) {
//     const role = Roles.findOne({ name });
//     return role ?? undefined;
// }

// setRole({ description: 'admin role', name: 'admin', scope: RoleScope.Users });
// setRole({ description: 'user role', name: 'user', scope: RoleScope.Users });
// setRole({ description: 'editor role', name: 'editor', scope: RoleScope.Users });
// setRole({ description: 'owner role', name: 'owner', scope: RoleScope.Courses });
// setRole({ description: 'moderator role', name: 'moderator', scope: RoleScope.Courses });
// setRole({ description: 'custom role', name: 'custom_role', scope: RoleScope.Courses });
