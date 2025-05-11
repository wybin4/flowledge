import { DefaultRoles } from "@/user/types/UserType";
import { EditorPermissions } from "../types/EditorPermissions";

export const isEditorDisabled = (roles: string[], permissions: EditorPermissions = {}): boolean => {
    const { manageOwners, manageModerators } = permissions;

    const hasOwnerRole = roles.includes(DefaultRoles.OWNER.toLowerCase());
    const hasModeratorRole = roles.includes(DefaultRoles.MODERATOR.toLowerCase());

    if (hasOwnerRole && !manageOwners) {
        return true;
    }

    if (hasModeratorRole && !manageModerators) {
        return true;
    }

    return false;
};