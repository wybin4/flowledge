import { CourseTagsTablePage } from "@/courses/CourseTagsTablePage/CourseTagsTablePage";
import { TablePageMode } from "@/types/TablePageMode";

export default async function CourseTagsPage({ searchParams }: { searchParams: { mode?: string } }) {
    const { mode } = await searchParams;
    return <CourseTagsTablePage mode={mode as TablePageMode} />;
}