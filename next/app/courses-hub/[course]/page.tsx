import { CoursesHubDetails } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetails";
import { TablePageMode } from "@/types/TablePageMode";
import { LessonItem } from "@/courses/courses-hub/components/LessonItem/LessonItem";
import { CoursesHubDetailsPage } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetailsPage";

export default async function CoursesHubSectionPage({
    params,
    searchParams
}: {
    params: { course: string };
    searchParams?: { createLesson?: string };
}) {
    const { course } = params;
    const createLesson = searchParams?.createLesson === 'true';

    if (createLesson) {
        return <LessonItem mode={TablePageMode.CREATE} />;
    }

    return (
        <CoursesHubDetailsPage courseId={course} isCreateLesson={createLesson} />
    );
}
