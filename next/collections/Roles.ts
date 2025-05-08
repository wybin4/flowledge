import { IRole, RoleScope } from "@/types/Role";
import { CachedCollection } from "./CachedCollection";

export const Roles = new CachedCollection<IRole>('roles');

export function getRolesFromScope(scope: RoleScope): IRole[] {
    return Roles.collection.find({ scopes: { $contains: scope } });
}
