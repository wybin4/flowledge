import PageLayout from "@/components/PageLayout/PageLayout";
import { IconKey } from "@/hooks/useIcon";

export default async function DynamicCourseListSectionPage({ params }: { params: { section: string } }) {
    const { section } = await params;

    return (
        <PageLayout
            name={section as IconKey}
            translateName={false}
        />
    );
}
