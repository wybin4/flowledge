import PageLayout from "@/components/pageLayout/PageLayout";
import { IconKey } from "@/hooks/useIcon";

export default async function DynamicCourseSectionPage({ params }: { params: { section: string } }) {
    const { section } = await params;

    return (
        <PageLayout
            name={section as IconKey}
            translateName={false}
            headerChildren={<></>}
            mainChildren={
                <>

                </>
            }
        />
    );
}
