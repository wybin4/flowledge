import cn from "classnames";
import styles from "./EnhancedBreadcrumbs.module.css";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useIcon } from "@/hooks/useIcon";
import { EnhancedCrumb } from "@/types/EnhancedCrumb";

type EnhancedBreadcrumbsProps = {
    className?: string;
    children: ReactNode;
    crumbs: EnhancedCrumb[];
};

export const EnhancedBreadcrumbs = ({ crumbs, className, children }: EnhancedBreadcrumbsProps) => {
    const { t } = useTranslation();
    const checkIcon = useIcon('check');

    return (
        <div className={cn(styles.container, className)}>
            <div className={styles.crumbContainer}>
                {crumbs.map((crumb, index) => (
                    <div key={index} className={styles.checkContainer}>
                        <div className={styles.checkIcon}>{crumb.checked ? checkIcon : ' — '}</div>
                        <div>{t(crumb.name)}</div>
                    </div>
                ))}
            </div>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};