"use client";

import { useUserSettingTabs } from "@/user/hooks/useUserSettingTabs";
import { redirect } from "next/navigation";

export default function UserSettingsPage() {
    const tabs = useUserSettingTabs();

    if (tabs.length) {
        redirect(`/user-settings/${tabs[0].name}`);
    }
}
