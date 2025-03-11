import RightSidebar from "@/components/sidebar/RightSidebar";

export default async function DynamicCourseLessonPage({ params }: { params: { lesson: string } }) {
    return (
        <>
            <RightSidebar>
                <div>click on me</div>
            </RightSidebar>
        </>
    );
}
