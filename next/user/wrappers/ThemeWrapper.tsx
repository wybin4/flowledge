"use client";
import { useEffect, useState } from "react";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Theme } from "@/user/types/Theme";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const [deviceTheme, setDeviceTheme] = useState<Theme>(Theme.Light);
    const theme = useUserSetting<Theme>('theme') || Theme.Auto;
    
    useEffect(() => {
        if (theme === Theme.Auto) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const updateDeviceTheme = (e: MediaQueryListEvent) => {
                setDeviceTheme(e.matches ? Theme.Dark : Theme.Light);
            };

            if (mediaQuery.matches) {
                setDeviceTheme(Theme.Dark);
            } else {
                setDeviceTheme(Theme.Light);
            }

            mediaQuery.addEventListener('change', updateDeviceTheme);

            return () => {
                mediaQuery.removeEventListener('change', updateDeviceTheme);
            };
        } else {
            setDeviceTheme(theme);
        }
    }, [theme]);
    useEffect(() => {
        document.body.classList.remove(Theme.Light.toLowerCase(), Theme.Dark.toLowerCase());
        document.body.classList.add(deviceTheme.toLowerCase());
    }, [deviceTheme]);

    return <>{children}</>;
}
