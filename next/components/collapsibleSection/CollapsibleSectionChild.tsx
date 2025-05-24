"use client";

import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import { ReactNode } from "react";
import CollapsibleSectionTitleTags, { CollapsibleSectionTitleTag } from "./CollapsibleSectionTitleTags";

type CollapsibleSectionChildProps = {
    id?: string;
    title: string;
    onClick?: (id?: string) => void;
    additionalInfo?: string;
    time?: string;
    description?: string;
    image?: ReactNode;
    isActive?: boolean;
    isViewed?: boolean;
    titleTags?: CollapsibleSectionTitleTag[];
    childClassName?: string;
    titleContainerClassName?: string;
    titleContainerContentClassName?: string;
    titleTextContainerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    timeClassName?: string;
    additionalInfoClassName?: string;
    children?: ReactNode;
};

export default function CollapsibleSectionChild({
    id, title, time, description, image, additionalInfo, children, onClick,
    isActive = false, isViewed = false, titleTags,
    childClassName,
    titleContainerClassName, titleContainerContentClassName, titleTextContainerClassName, titleClassName,
    descriptionClassName,
    timeClassName, additionalInfoClassName
}: CollapsibleSectionChildProps) {
    return (
        <div onClick={() =>
            onClick?.(id)} className={cn(styles.child, childClassName, {
                [styles.active]: isActive,
                [styles.viewed]: isViewed
            })}>
            <div className={cn(styles.childTitle, titleContainerClassName)}>
                {image}
                <div className={cn(styles.childTitleContainer, titleTextContainerClassName)}>
                    <div className={descriptionClassName}>{description}</div>
                    <div className={cn(styles.childTitleContent, titleContainerContentClassName)}>
                        <div className={titleClassName}>{title}</div>
                        {titleTags && <CollapsibleSectionTitleTags titleTags={titleTags} />}
                    </div>
                    {additionalInfo && <div className={additionalInfoClassName}>{additionalInfo}</div>}
                    {children && <div>{children}</div>}
                </div>
            </div>
            <div className={timeClassName}>{time}</div>
        </div>
    );
}
