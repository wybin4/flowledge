"use client";

import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import { ReactNode } from "react";
import CollapsibleSectionTitleTags, { CollapsibleSectionTitleTag } from "./CollapsibleSectionTitleTags";

type CollapsibleSectionChildProps = {
    id?: string;
    title: string;
    onClick?: (id: string) => void;
    additionalInfo?: string;
    time: string;
    image?: ReactNode;
    isActive?: boolean;
    isViewed?: boolean;
    titleTags?: CollapsibleSectionTitleTag[];
    childClassName?: string;
    titleContainerClassName?: string;
    titleContainerContentClassName?: string;
    titleClassName?: string;
    timeClassName?: string;
    additionalInfoClassName?: string;
};

export default function CollapsibleSectionChild({
    id, title, time, image, additionalInfo, onClick,
    isActive = false, isViewed = false, titleTags,
    childClassName, titleContainerClassName, titleContainerContentClassName, titleClassName, timeClassName, additionalInfoClassName
}: CollapsibleSectionChildProps) {
    return (
        <div onClick={() => id && onClick?.(id)} className={cn(styles.child, childClassName, {
            [styles.active]: isActive,
            [styles.viewed]: isViewed
        })}>
            <div className={cn(styles.childTitle, titleContainerClassName)}>
                {image}
                <div className={styles.childTitleContainer}>
                    <div className={cn(styles.childTitleContent, titleContainerContentClassName)}>
                        <div className={titleClassName}>{title}</div>
                        {titleTags && <CollapsibleSectionTitleTags titleTags={titleTags} />}
                    </div>
                    {additionalInfo && <div className={additionalInfoClassName}>{additionalInfo}</div>}
                </div>
            </div>
            <div className={timeClassName}>{time}</div>
        </div>
    );
}
