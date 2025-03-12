import RightSidebar from "@/components/sidebar/RightSidebar";
import { StuffUpload } from "@/stuff/components/StuffUpload";

export default async function DynamicCourseLessonPage({ params }: { params: { lesson: string } }) {
    return (
        <>
            <RightSidebar>
                <div>click on me</div>
            </RightSidebar>
            <StuffUpload />
        </>
    );
}
