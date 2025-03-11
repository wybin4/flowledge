"use client";

import { usePrivateSettingTabs } from "@/private-settings/hooks/usePrivateSettingTabs";
import { redirect } from "next/navigation";

export default function PrivateSettingsPage() {
    const tabs = usePrivateSettingTabs();
   
    if (tabs.length) {
        redirect(`/private-settings/${tabs[0].name}`);
    }
}
