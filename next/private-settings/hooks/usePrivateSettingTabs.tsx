import { PrivateSettings } from "@/collections/PrivateSettings";
import { SettingValue, SettingsTab } from "@/types/Setting";
import { useMemo } from "react";

function getTabFromId(_id: string) {
    const parts = _id.split('.');
    return parts.length > 1 ? parts[0] : undefined;
}

function useSettingTabs(settings: SettingValue[]): Omit<SettingsTab, 'settings'>[] {
    const tabs = settings
        .map(setting => getTabFromId(setting._id))
        .filter(tab => tab !== undefined);

    const uniqueTabs = Array.from(new Set(tabs));

    return uniqueTabs.map(uniqueTab => {
        return {
            name: uniqueTab,
            label: `${uniqueTab}.name`,
        };
    });
}

export function usePrivateSettingTabs(): ReturnType<typeof useSettingTabs> {
    const settings = PrivateSettings.collection.find();
    return useMemo(() => useSettingTabs(settings), [settings]);
}