"use client";

import { useIcon } from "@/hooks/useIcon";
import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import { ReactNode } from "react";

type CollapsibleSectionChildProps = {
    id?: string;
    title: string;
    onClick?: (id: string) => void;
    additionalInfo?: string;
    time: string;
    image?: ReactNode;
    isActive?: boolean;
    isViewed?: boolean;
    isLocked?: boolean;
    childClassName?: string;
    titleContainerClassName?: string;
    titleClassName?: string;
    timeClassName?: string;
    additionalInfoClassName?: string;
};

export default function CollapsibleSectionChild({
    id, title, time, image, additionalInfo, onClick,
    isActive = false, isViewed = false, isLocked = false,
    childClassName, titleContainerClassName, titleClassName, timeClassName, additionalInfoClassName
}: CollapsibleSectionChildProps) {
    const lockedIcon = useIcon('locked');

    return (
        <div onClick={() => id && onClick?.(id)} className={cn(styles.child, childClassName, {
            [styles.active]: isActive,
            [styles.viewed]: isViewed
        })}>
            <div className={cn(styles.childTitle, titleContainerClassName)}>
                {image}
                <div className={styles.childTitleContainer}>
                    <div>
                        <div className={titleClassName}>{title}</div>
                        {isLocked && <div>{lockedIcon}</div>}
                    </div>
                    {additionalInfo && <div className={additionalInfoClassName}>{additionalInfo}</div>}
                </div>
            </div>
            <div className={timeClassName}>{time}</div>
        </div>
    );
}
