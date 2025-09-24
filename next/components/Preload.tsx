"use client";

import { CourseSubscriptions } from "@/collections/CourseSubscriptions";
import { Permissions } from "@/collections/Permissions";
import { PrivateSettings } from "@/collections/PrivateSettings";
import { Roles } from "@/collections/Roles";
import { initializeWebSocket } from "@/socket/WebSocketClient";
import UserService from "@/user/UserService";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const Preload: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const loadUserSettings = async () => {
            await initializeWebSocket();

            try {
                await PrivateSettings.listen();
                await Roles.listen();
                await Permissions.listen();
                // await CourseSubscriptions.listen();
                await UserService.fetchUser();
                UserService.subscribeToUserChanges();

                setLoading(false);
                document.body.classList.remove('hide-sidebar');
                router.push('');
            } catch (error) {
                console.error("Error loading settings:", error);
            }
        };
        loadUserSettings();
    }, []);

    // useEffect(() => {
    //     if (pathname == '/login') {
    //         document.body.classList.add('hide-sidebar');
    //     }
    // }, [pathname]);

    // if (loading && pathname != '/login') {
    //     router.push('/login');
    //     return <div>Loading...</div>;
    // }

    return <>{children}</>;
};

export default Preload;
