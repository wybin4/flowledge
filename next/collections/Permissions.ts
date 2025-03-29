import { IPermission } from "@/types/Permission";
import { CachedCollection } from "./CachedCollection";
import { GetDataPage } from "@/types/GetDataPage";
import { GetTotalCountPage } from "@/types/GetTotalCountPage";

export const Permissions = new CachedCollection<IPermission>('permissions');

export const getPermissionsPage = ({ page, pageSize, searchQuery }: GetDataPage): IPermission[] => {
    const offset = (page - 1) * pageSize;

    return Permissions.collection.chain()
        .find(searchQuery ? {
            _id: { $regex: new RegExp(searchQuery, "i") }
        } : {})
        .offset(offset)
        .limit(pageSize)
        .data();
};

export const getTotalPermissionsCount = ({ searchQuery }: GetTotalCountPage): number => {
    if (!searchQuery) {
        return Permissions.collection.count();
    }

    return Permissions.collection.chain()
        .find({ _id: { $regex: new RegExp(searchQuery, "i") } })
        .data().length;
};

// export function setPermission(permission: IPermission) {
//     Permissions.insertOne(permission);
// }

// export function getPermission(name: string) {
//     const permission = Permissions.findOne({ name });
//     return permission ?? undefined;
// }

// setPermission({ name: 'view-private-settings', roles: ['admin'] });
// setPermission({ name: 'edit-private-settings', roles: ['admin'] });
// setPermission({ name: 'manage-permissions', roles: ['admin'] });

// setPermission({ name: 'view-all-courses', roles: ['admin'] });
// setPermission({ name: 'view-assigned-courses', roles: ['moderator', 'owner', 'user'] });
// setPermission({ name: 'edit-assigned-courses', roles: ['moderator', 'owner'] });
// setPermission({ name: 'edit-all-courses', roles: ['admin'] });
// setPermission({ name: 'delete-course', roles: ['admin'] });
// setPermission({ name: 'delete-assigned-course', roles: ['moderator', 'owner'] });

// setPermission({ name: 'assign-users-to-course', roles: ['admin', 'owner'] });
// setPermission({ name: 'remove-users-from-course', roles: ['admin', 'owner'] });

// setPermission({ name: 'create-course', roles: ['admin'] });

// setPermission({ name: 'view-own-stats', roles: ['user'] });
// setPermission({ name: 'view-assigned-stats', roles: ['admin', 'moderator', 'owner'] });
// setPermission({ name: 'view-all-stats', roles: ['admin'] });
