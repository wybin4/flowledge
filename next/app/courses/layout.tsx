"use client";
import { Breadcrumbs } from "@/components/breadcrumbs/Breadcrumbs";
import PageLayout from "@/components/pageLayout/PageLayout";
import { usePathname } from "next/navigation";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isCoursesPage = pathname === "/courses";
    if (isCoursesPage) {
        return (
            <PageLayout
                name='courses'
                headerChildren={<></>}
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
