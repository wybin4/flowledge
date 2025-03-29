import { CoursesHubItem } from "@/courses-hub/components/CoursesHubItem";
import { TablePageMode } from "@/types/TablePageMode";

export default async function CoursesHubItemPage({ params, searchParams }: { params: { id: string }, searchParams: { mode?: string } }) {
    const { id } = await params;
    const { mode } = await searchParams;

    return (
        <CoursesHubItem mode={mode as TablePageMode} _id={id} />
    );
}
