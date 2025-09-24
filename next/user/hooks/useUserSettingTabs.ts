import { getPrivateSettingsByRegex } from "@/collections/PrivateSettings";
import { useMemo } from "react";
import userService from "../UserService";
import { SettingValue, SettingsTab } from "@/types/Setting";

function getTabFromId(id: string) {
    const parts = id.split('.');
    return { group: parts.length > 1 ? parts[0] : undefined, tab: parts.length > 1 ? parts[1] : undefined };
}

function useSettingTabs(settings: SettingValue[]): Omit<SettingsTab, 'settings'>[] {
    const tabs = settings
        .map(setting => getTabFromId(setting.id))
        .filter(tab => tab.tab !== undefined);

    const uniqueTabs = Array.from(new Set(tabs.map(tab => `${tab.group}.${tab.tab}`)));

    return uniqueTabs.map(uniqueTab => {
        const [, tab] = uniqueTab.split('.');
        return {
            name: tab,
            label: `${uniqueTab}.name`,
        };
    });
}

export function useUserSettingTabs(): ReturnType<typeof useSettingTabs> {
    const settings = getPrivateSettingsByRegex([userService.getUserSettingRegex()]);
    return useMemo(() => useSettingTabs(settings), [settings]);
}