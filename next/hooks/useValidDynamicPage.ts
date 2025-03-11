import { notFound } from "next/navigation";

export function useValidDynamicPage<T extends { name: string }>(slug: string, pageList: T[]) {
    const validSlugs = pageList.map(page => page.name);
    const currentPage = pageList.find(page => slug === page.name);

    if (!validSlugs.includes(slug) || !currentPage) {
        notFound();
    }
}