"use client";

import { useState } from "react";
import { IconKey, useIcon } from "@/hooks/useIcon";
import styles from "./CollapsibleSection.module.css";
import cn from "classnames";

type CollapsibleSectionProps = {
    title: string;
    children: React.ReactNode;
    expandedByDefault: boolean;
    containerClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
    iconPrefix?: string;
};

export default function CollapsibleSection({
    title, expandedByDefault,
    children, iconPrefix = '',
    containerClassName, headerClassName, contentClassName
}: CollapsibleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const expandIcon = useIcon(`expand${iconPrefix}` as IconKey);

    return (
        <div className={containerClassName}>
            <div
                className={cn(styles.header, headerClassName)}
                onClick={() => setIsExpanded((prev) => !prev)}
            >
                <h3>{title}</h3>
                <div className={cn(styles.icon, { [styles.expanded]: isExpanded })}>{expandIcon}</div>
            </div>
            <div className={cn(contentClassName, { [styles.hidden]: !isExpanded })}>
                {children}
            </div>
        </div>
    );
}
