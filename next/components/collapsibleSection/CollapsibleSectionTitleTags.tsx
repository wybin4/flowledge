"use client";

import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import { CollapsibleSectionTagType } from "./CollapsibleSection";
import { JSX } from "react";

export type CollapsibleSectionTitleTag = {
    title: string;
    type: CollapsibleSectionTagType;
    icon?: JSX.Element;
};

export default function CollapsibleSectionTitleTags(
    { titleTags }: { titleTags: CollapsibleSectionTitleTag[] }
) {
    return (
        <>
            {
                titleTags.map((tag, index) => (
                    <div key={index} className={cn(styles.tag, styles[tag.type], {
                        [styles.tagWithIcon]: tag.icon
                    })}>
                        <div className={styles.tagTitleContainer}>
                            {tag.icon && <div className={styles.tagTitleIcon}>{tag.icon}</div>}
                            <div>{tag.title}</div>
                        </div>
                    </div>
                ))
            }
        </>
    );
}
