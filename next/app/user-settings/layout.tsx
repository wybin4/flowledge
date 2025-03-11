"use client";

import PageLayout from "@/components/pageLayout/PageLayout";
import { SettingsTab } from "@/components/settings/settingsTab/SettingsTab";
import { useUserSettingTabs } from "@/user/hooks/useUserSettingTabs";

export default function PublicSettingsLayout({ children }: { children: React.ReactNode }) {
    const tabs = useUserSettingTabs();
   
    return (
        <PageLayout
            name='user-settings'
            headerChildren={
                <>
                    {tabs.map((st, index) => (
                        <SettingsTab key={index} index={index} {...st} />
                    ))}
                </>
            }
            mainChildren={children}
        />
    );
}
