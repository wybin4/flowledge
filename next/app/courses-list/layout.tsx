"use client";
import PageLayout from "@/components/PageLayout/PageLayout";
import { usePathname } from "next/navigation";
import { coursesListPrefix } from "@/helpers/prefixes";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { InfiniteSearch } from "@/components/InfiniteSearch/InfiniteSearch";

export default function CoursesListLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isCoursesListPage = pathname === `/${coursesListPrefix}`;
    if (isCoursesListPage) {
        return (
            <PageLayout
                name={coursesListPrefix}
                headerTopChildren={<InfiniteSearch />}
                mainChildren={children}
                mainChildrenPosition={ChildrenPosition.Bottom}
            />
        );
    }

    return (<>{children}</>);
}
