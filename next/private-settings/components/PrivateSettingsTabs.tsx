"use client";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { useValidDynamicPage } from "@/hooks/useValidDynamicPage";
import { usePrivateSettingTabs } from "../hooks/usePrivateSettingTabs";
import { usePrivateSettings } from "../hooks/usePrivateSettings";

export const PrivateSettingsTabs = ({ tabName }: { tabName: string }) => {
    const tabs = usePrivateSettingTabs();

    useValidDynamicPage(tabName, tabs);

    const { settings, handleSave } = usePrivateSettings(tabName);

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
