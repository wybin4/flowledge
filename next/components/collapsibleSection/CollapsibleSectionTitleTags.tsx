"use client";

import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import { CollapsibleSectionTagType } from "./CollapsibleSection";

export type CollapsibleSectionTitleTag = {
    title: string;
    type: CollapsibleSectionTagType;
};

export default function CollapsibleSectionTitleTags(
    { titleTags }: { titleTags: CollapsibleSectionTitleTag[] }
) {
    return (
        <>
            {
                titleTags.map((tag, index) => (
                    <div key={index} className={cn(styles.tag, styles[tag.type])}>
                        <div className={styles.tagTitle}>{tag.title}</div>
                    </div>
                ))
            }
        </>
    );
}
