import { CreateLesson, CreateLessonProps } from "@/courses/courses-hub/components/CreateLesson/CreateLesson";

export default async function DynamicCourseHubLessonPage({
    params, searchParams
}: {
    params: { lesson: string };
    searchParams?: CreateLessonProps;
}) {
    const { lesson } = await params;
    const searchParamsRes = await searchParams;

    return <CreateLesson _id={lesson} {...searchParamsRes} />;
}
