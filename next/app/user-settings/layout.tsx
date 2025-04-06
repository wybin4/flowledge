"use client";

import PageLayout from "@/components/PageLayout/PageLayout";
import { SettingsTab } from "@/components/Settings/SettingsTab/SettingsTab";
import { useUserSettingTabs } from "@/user/hooks/useUserSettingTabs";

export default function PublicSettingsLayout({ children }: { children: React.ReactNode }) {
    const tabs = useUserSettingTabs();

    return (
        <PageLayout
            name='user-settings'
            headerProps={{
                headerChildren:
                    <>
                        {tabs.map((st, index) => (
                            <SettingsTab key={index} index={index} {...st} />
                        ))}
                    </>
            }}
            mainChildren={children}
        />
    );
}
