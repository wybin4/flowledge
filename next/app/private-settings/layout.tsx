"use client";

import PageLayout from "@/components/pageLayout/PageLayout";
import { SettingsTab } from "@/components/settings/settingsTab/SettingsTab";
import { usePrivateSettingTabs } from "@/private-settings/hooks/usePrivateSettingTabs";

export default function PrivateSettingsLayout({ children }: { children: React.ReactNode }) {
    const tabs = usePrivateSettingTabs();
 
    return (
        <PageLayout
            name='private-settings'
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
