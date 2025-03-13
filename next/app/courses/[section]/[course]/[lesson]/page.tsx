import { LessonsPage } from "@/components/lessons/LessonsPage";

export default async function DynamicCourseLessonPage({ params }: { params: { lesson: string } }) {
    return (<LessonsPage />);
}
