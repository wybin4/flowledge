import { CourseListLessonPage } from "@/courses/courses-list/components/CoursesListItem/CourseListLessonPage/CourseListLessonPage";
import { CourseListSurvey } from "@/courses/courses-list/components/CoursesListItem/CoursesListItem/CourseListSurvey/CourseListSurvey";

export default async function DynamicCourseListLessonPage(
    { params, searchParams }: { params: { lesson: string; }; searchParams?: { survey?: boolean }; }
) {
    const { lesson } = await params;
    const searchParamsRes = await searchParams;

    if (searchParamsRes && searchParamsRes.survey) {
        return <CourseListSurvey lessonId={lesson} />;
    }

    return <CourseListLessonPage lessonId={lesson} />;
}