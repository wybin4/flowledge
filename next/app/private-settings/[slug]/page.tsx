import { PrivateSettingsTabs } from "@/private-settings/components/PrivateSettingsTabs";

export default async function DynamicPrivateSettingsPage({ params }: { params: { slug: string } }) {
    const prs = await params;
    return <PrivateSettingsTabs tabName={prs.slug} />;
}
