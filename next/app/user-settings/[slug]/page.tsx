import { UserSettingsTabs } from "@/user/components/UserSettingsTabs";

export default async function DynamicUserSettingsPage({ params }: { params: { slug: string } }) {
    const prs = await params;
    return <UserSettingsTabs tabName={prs.slug} />;
}
