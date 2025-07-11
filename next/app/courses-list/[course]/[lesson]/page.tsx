import { CourseListLessonPage } from "@/courses/courses-list/components/CoursesListItem/CourseListLessonPage/CourseListLessonPage";

export default async function DynamicCourseListLessonPage(
    { params, searchParams }: { params: { lesson: string; }; searchParams?: { survey?: boolean; version: string; }; }
) {
    const { lesson } = await params;
    const searchParamsRes = await searchParams;

    return (
        <CourseListLessonPage
            lessonId={lesson}
            isSurvey={searchParamsRes?.survey}
            version={searchParamsRes?.version}
        />
    );
}