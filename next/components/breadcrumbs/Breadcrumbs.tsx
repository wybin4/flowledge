"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIcon } from "@/hooks/useIcon";
import styles from "./Breadcrumbs.module.css";
import { ReactNode } from "react";
import cn from "classnames";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useTranslation } from "react-i18next";

export const Breadcrumbs = ({ position = ChildrenPosition.Top }: {
    position?: ChildrenPosition.Top | ChildrenPosition.Left
}): ReactNode => {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);
    const separatorIcon = useIcon("separator");
    const { t } = useTranslation();

    if (pathSegments.length === 0) return <></>;

    let path = "";

    return (
        <nav aria-label="breadcrumb">
            <ul className={cn(styles.container, {
                [styles.top]: position === ChildrenPosition.Top,
            })}>
                {pathSegments.map((segment, index) => {
                    path += `/${segment}`;
                    const isLast = index === pathSegments.length - 1;
                    const translatedSegment = index === 0 ? t(`sidebar.${segment}`) : decodeURIComponent(segment);
                    return (
                        <li key={path} className={styles.item}>
                            {index > 0 && <span className={styles.separator}>{separatorIcon}</span>}
                            {!isLast ? (
                                <Link href={path} className={styles.link}>
                                    {translatedSegment}
                                </Link>
                            ) : (
                                <span className={styles.current}>{translatedSegment}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
