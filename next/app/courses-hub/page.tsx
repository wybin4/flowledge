import { CoursesHubItem } from "@/courses/courses-hub/components/CoursesHubItem";
import { CoursesHubTablePage } from "@/courses/courses-hub/components/CoursesHubTablePage";
import { TablePageMode } from "@/types/TablePageMode";

export default async function CoursesHubPage({ searchParams }: { searchParams: { mode?: string } }) {
    const { mode } = await searchParams;

    if (mode === TablePageMode.CREATE) {
        return <CoursesHubItem mode={mode as TablePageMode} />;
    }

    return <CoursesHubTablePage />;
}