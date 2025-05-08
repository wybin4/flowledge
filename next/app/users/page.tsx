import { TablePageMode } from "@/types/TablePageMode";
import { UsersTablePage } from "@/user/components/UsersTablePage/UsersTablePage";

export default async function UsersPage({ searchParams }: { searchParams: { mode?: string } }) {
    const { mode } = await searchParams;
    return <UsersTablePage mode={mode as TablePageMode} />;
}