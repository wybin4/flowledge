import { TablePageMode } from "@/types/TablePageMode";
import { LessonItem } from "@/courses/courses-hub/components/LessonItem/LessonItem";
import { CoursesHubDetailsPage } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetailsPage";

export default async function CoursesHubSectionPage({
    params,
    searchParams
}: {
    params: { course: string };
    searchParams?: { uploadVideo?: string };
}) {
    const { course } = params;
    const uploadVideo = searchParams?.uploadVideo === 'true';

    if (uploadVideo) {
        return <LessonItem mode={TablePageMode.CREATE} />;
    }

    return (
        <CoursesHubDetailsPage courseId={course} isUploadVideo={uploadVideo} />
    );
}
