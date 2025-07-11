"use client";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { useValidDynamicPage } from "@/hooks/useValidDynamicPage";
import { useUserSettingTabs } from "../hooks/useUserSettingTabs";
import { useUserSettings } from "../hooks/useUserSettings";

export const UserSettingsTabs = ({ tabName }: { tabName: string }) => {
    const tabs = useUserSettingTabs();

    useValidDynamicPage(tabName, tabs);

    const { settings, handleSave } = useUserSettings(tabName);

    return (
        <>
            {settings.map((setting, index) => (
                <SettingWrapper
                    key={index}
                    isOptionsTranslatable={true}
                    setting={setting}
                    handleSave={handleSave}
                />
            ))}
        </>
    );
}
