"use client";

import { useIcon } from "@/hooks/useIcon";
import styles from "./CollapsibleSection.module.css";
import cn from "classnames";

type CollapsibleSectionChildProps = {
    title: string;
    time: string;
    isActive: boolean;
    isViewed: boolean;
    isLocked: boolean;
};

export default function CollapsibleSectionChild({ title, time, isActive, isViewed, isLocked }: CollapsibleSectionChildProps) {
    const lockedIcon = useIcon('locked');

    return (
        <div className={cn(styles.child, {
            [styles.active]: isActive,
            [styles.viewed]: isViewed
        })}>
            <div className={styles.childTitle}>
                <div>{title}</div>
                {isLocked && <div>{lockedIcon}</div>}
            </div>
            <div>{time}</div>
        </div>
    );
}
