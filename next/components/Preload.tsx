"use client";

import { CourseSubscriptions } from "@/collections/CourseSubscriptions";
import { Permissions } from "@/collections/Permissions";
import { PrivateSettings } from "@/collections/PrivateSettings";
import { Roles } from "@/collections/Roles";
import UserService from "@/user/UserService";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const Preload: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const pathname = usePathname();

    useEffect(() => {
        const loadUserSettings = async () => {
            try {
                await PrivateSettings.listen();
                await Roles.listen();
                await Permissions.listen();
                await CourseSubscriptions.listen();
                await UserService.fetchUser();
                UserService.subscribeToUserChanges();

                setLoading(false);
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        };
        loadUserSettings();
    }, []);

    if (loading && pathname != '/login') {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default Preload;
