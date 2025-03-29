import { LessonsPage } from "@/components/Lessons/LessonsPage";

export default async function DynamicCourseListLessonPage({ params }: { params: { lesson: string } }) {
    return (<LessonsPage />);
}
