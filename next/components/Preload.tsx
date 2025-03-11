"use client";
import { Permissions } from "@/collections/Permissions";
import { PrivateSettings } from "@/collections/PrivateSettings";
import { Roles } from "@/collections/Roles";
import UserService from "@/user/UserService";
import { ReactNode, useEffect, useState } from "react";

const Preload: React.FC<{ children: ReactNode }> = ({ children }) => {
    // const context = useContext(WebSocketContext);

    // if (!context) {
    //     throw new Error("WebSocketContext is not available");
    // }

    // const { subscribeToChannel, unsubscribeFromChannel, isConnected } = context;

    // useEffect(() => {
    //     if (!isConnected) {
    //         console.log("WebSocket is not connected yet.");
    //         return;
    //     }

    //     const channel = "/topic/public-settings-changed";
    //     const messageCallback = (message: any) => {
    //         console.log("Получено сообщение: ", message.body);
    //     };

    //     subscribeToChannel(channel, messageCallback);

    //     return () => {
    //         unsubscribeFromChannel(channel);
    //         console.log(`Отписались от канала: ${channel}`);
    //     };
    // }, [subscribeToChannel, unsubscribeFromChannel, isConnected]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserSettings = async () => {
            try {
                await PrivateSettings.listen();
                await Roles.listen();
                await Permissions.listen();

                await UserService.fetchUser();
                UserService.subscribeToUserChanges();
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUserSettings();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default Preload;
