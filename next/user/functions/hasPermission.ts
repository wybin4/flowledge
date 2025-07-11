import { Roles } from "@/collections/Roles";
import { User } from "../types/User";
import { Permissions } from "@/collections/Permissions";

export function hasPermission(permissionId: string, user: User) {
    const permission = Permissions.collection.findOne({ _id: permissionId });
    const roles = permission?.roles ?? [];

    return roles.some((roleId) => {
        const role = Roles.collection.findOne({ _id: roleId });
        return role && user.roles.includes(roleId);
    });
}