import { CoursesHubTablePage } from "@/courses/courses-hub/components/CoursesHubTablePage/CoursesHubTablePage";
import { TablePageMode } from "@/types/TablePageMode";

export default async function CoursesHubPage({ searchParams }: { searchParams: { mode?: string } }) {
    const { mode } = await searchParams;
    return <CoursesHubTablePage mode={mode as TablePageMode} />;
}