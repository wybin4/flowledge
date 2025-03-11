"use client";

import { useState } from "react";
import { useIcon } from "@/hooks/useIcon";
import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import CollapsibleSectionChild from "./CollapsibleSectionChild";

type CollapsibleSectionProps = {
    title: string;
    children: React.ReactNode;
    expandedByDefault: boolean;
};

export default function CollapsibleSection({ title, expandedByDefault, children }: CollapsibleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const collapseIcon = useIcon('collapse');
    const expandIcon = useIcon('expand');

    return (
        <div className={styles.container}>
            <div
                className={styles.header}
                onClick={() => setIsExpanded((prev) => !prev)}
            >
                <h3>{title}</h3>
                <div>{isExpanded ? collapseIcon : expandIcon}</div>
            </div>
            <div className={cn(styles.content, { [styles.hidden]: !isExpanded })}>
                <CollapsibleSectionChild title='жизненный цикл' time='14 мин' isActive={false} isViewed={true} isLocked={false} />
                <CollapsibleSectionChild title='классификация' time='5 мин' isActive={true} isViewed={false} isLocked={false} />
                <CollapsibleSectionChild title='факторы' time='4 мин' isActive={false} isViewed={false} isLocked={true} />
            </div>
        </div>
    );
}
