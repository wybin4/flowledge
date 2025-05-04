"use client";

import cn from "classnames";
import styles from "./EnhancedBreadcrumbs.module.css";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useIcon } from "@/hooks/useIcon";
import { EnhancedCrumb } from "@/types/EnhancedCrumb";
import { useRouter } from "next/navigation";

type EnhancedBreadcrumbsProps = {
    prefix: string;
    className?: string;
    children: ReactNode;
    crumbs: EnhancedCrumb[];
};

export const EnhancedBreadcrumbs = ({ prefix, crumbs, className, children }: EnhancedBreadcrumbsProps) => {
    const { t } = useTranslation();
    const checkIcon = useIcon('check');

    const router = useRouter();

    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.crumbContainer}>
                {crumbs.map((crumb, index) => (
                    <div
                        key={index}
                        onClick={() => crumb.onClick?.(router)}
                        className={cn(styles.checkContainer, {
                            [styles.prevOrNext]: !crumb.current,
                            [styles.clickable]: crumb.onClick
                        })}
                    >
                        <div className={styles.checkIcon}>{crumb.checked ? checkIcon : ' — '}</div>
                        <div className={cn({
                            [styles.current]: crumb.current,
                        })}>{t(`${prefix}.${crumb.name}`)}</div>
                    </div>
                ))}
            </div>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};