"use client";

import { LoginResponse } from "@/types/LoginResponse";
import { getTokensClient } from "@/auth/tokens";
import { CourseSubscriptions } from "@/collections/CourseSubscriptions";
import { Permissions } from "@/collections/Permissions";
import { PrivateSettings } from "@/collections/PrivateSettings";
import { Roles } from "@/collections/Roles";
import UserService from "@/user/UserService";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const Preload: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [tokens, setTokens] = useState<LoginResponse | undefined>(undefined);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchTokens = async () => {
            const tokens = await getTokensClient();
            if (!tokens) {
                if (pathname !== '/login') {
                    router.push('/login');
                }
                return;
            } else {
                router.push('/');
            }
            setTokens(tokens);
        };

        const loadUserSettings = async () => {
            try {
                await PrivateSettings.listen();
                await Roles.listen();
                await Permissions.listen();
                await CourseSubscriptions.listen();

                await UserService.fetchUser();
                UserService.subscribeToUserChanges();
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
        tokens && loadUserSettings();
    }, [JSON.stringify(tokens)]);

    if (loading && pathname != '/login') {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default Preload;
