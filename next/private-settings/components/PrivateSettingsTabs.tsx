"use client";
import { SettingWrapper } from "@/components/settings/settingWrapper/SettingWrapper";
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
                <SettingWrapper key={index} setting={setting} handleSave={handleSave} />
            ))}
        </>
    );
}
