"use client";

import { JSX } from "react";
import { Tag, TagType } from "../Tag/Tag";

export type CollapsibleSectionTitleTag = {
    title: string;
    type: TagType;
    icon?: JSX.Element;
};

export default function CollapsibleSectionTitleTags(
    { titleTags }: { titleTags: CollapsibleSectionTitleTag[] }
) {
    return (
        <>
            {
                titleTags.map((tag, index) => (
                    <Tag
                        key={index}
                        tag={tag.title}
                        type={tag.type}
                        icon={tag.icon}
                    />
                ))
            }
        </>
    );
}
