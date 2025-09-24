import { CourseListItemPage } from "@/courses/courses-list/components/CoursesListItem/CoursesListItem/CourseListItemPage";

export default async function DynamicCourseListSectionPage({ params }: { params: { course: string } }) {
    const { course } = await params;

    return <CourseListItemPage id={course} />;
}
