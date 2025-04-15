import { TablePageMode } from "@/types/TablePageMode";
import { CreateLessonDraft } from "@/courses/courses-hub/components/CreateLesson/CreateLessonDraft/CreateLessonDraft";
import { CoursesHubDetailsPage } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetailsPage";

export default async function CoursesHubSectionPage({
    params,
    searchParams
}: {
    params: { course: string };
    searchParams?: { sectionId?: string };
}) {
    const { course } = await params;
    const sectionId = await searchParams?.sectionId;

    if (sectionId) {
        return <CreateLessonDraft mode={TablePageMode.CREATE} sectionId={sectionId} />;
    }

    return (
        <CoursesHubDetailsPage courseId={course} sectionId={sectionId} />
    );
}
