import userService from "@/user/UserService";
import { useState, useEffect } from "react";
import { Permissions } from "@/collections/Permissions";

export const usePermissions = (permissionIds: string[]): boolean[] => {
    const getValues = () => {
        return permissionIds.map((id) => userService.hasPermission(id));
    };

    const [permissions, setPermissions] = useState<boolean[]>(getValues());

    useEffect(() => {
        setPermissions(getValues());
    }, [permissionIds]);

    useEffect(() => {
        const handlePermissionsChange = () => {
            setPermissions(getValues());
        };

        Permissions.on(Permissions.eventName, handlePermissionsChange);

        return () => {
            Permissions.off(Permissions.eventName, handlePermissionsChange);
        };
    }, [permissionIds]);

    return permissions;
};