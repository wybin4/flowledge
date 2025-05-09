import { Permissions } from "@/collections/Permissions";
import { useState, useEffect } from "react";
import { useStateFromService } from "./useStateFromService";
import userService from "@/user/UserService";

export const usePermission = (permissionId: string): boolean => {
    const getValue = () => userService.hasPermission(permissionId);
    const [hasOrNot, setHasOrNot] = useState<boolean>(getValue());

    useEffect(() => {
        setHasOrNot(getValue());
    }, [permissionId]);

    useStateFromService(
        getValue,
        Permissions.eventName,
        Permissions,
        (newState) => {
            setHasOrNot(newState ?? false);
        }
    );
   
    return hasOrNot;
};
