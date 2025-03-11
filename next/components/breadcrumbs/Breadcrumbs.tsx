"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIcon } from "@/hooks/useIcon";
import styles from "./Breadcrumbs.module.css";

export const Breadcrumbs = () => {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);
    const separatorIcon = useIcon("separator");

    if (pathSegments.length === 0) return null;

    let path = "";

    return (
        <nav aria-label="breadcrumb">
            <ul className={styles.container}>
                {pathSegments.map((segment, index) => {
                    path += `/${segment}`;
                    const isLast = index === pathSegments.length - 1;
                    return (
                        <li key={path} className={styles.item}>
                            {index > 0 && <span className={styles.separator}>{separatorIcon}</span>}
                            {!isLast ? (
                                <Link href={path} className={styles.link}>
                                    {decodeURIComponent(segment)}
                                </Link>
                            ) : (
                                <span className={styles.current}>{decodeURIComponent(segment)}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
