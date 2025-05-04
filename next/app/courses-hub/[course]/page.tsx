import { CoursesHubDetailsPage } from "@/courses/courses-hub/components/CoursesHubDetails/CoursesHubDetailsPage";

export default async function CoursesHubSectionPage({ params }: {
    params: { course: string };
}) {
    const { course } = await params;

    return (
        <CoursesHubDetailsPage courseId={course} />
    );
}
