"use client";
import { SettingWrapper } from "@/components/Settings/SettingWrapper/SettingWrapper";
import { useValidDynamicPage } from "@/hooks/useValidDynamicPage";
import { usePrivateSettingTabs } from "../hooks/usePrivateSettingTabs";
import { usePrivateSettings } from "../hooks/usePrivateSettings";
import { usePermission } from "@/hooks/usePermission";

export const PrivateSettingsTabs = ({ tabName }: { tabName: string }) => {
    const tabs = usePrivateSettingTabs();

    useValidDynamicPage(tabName, tabs);

    const { settings, handleSave } = usePrivateSettings(tabName);

    const isPermitted = usePermission('edit-private-settings');

    return (
        <>
            {settings.map((setting, index) => (
                <SettingWrapper
                    key={index}
                    isOptionsTranslatable={true}
                    setting={setting}
                    handleSave={handleSave}
                    disabled={!isPermitted}
                />
            ))}
        </>
    );
}
