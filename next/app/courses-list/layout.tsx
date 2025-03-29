"use client";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import PageLayout from "@/components/PageLayout/PageLayout";
import { usePathname } from "next/navigation";

export default function CoursesListLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isCoursesListPage = pathname === "/courses-list";
    if (isCoursesListPage) {
        return (
            <PageLayout
                name='courses-list'
                mainChildren={children}
            />
        );
    }

    return (
        <div>
            <Breadcrumbs />
            {children}
        </div>
    );
}
