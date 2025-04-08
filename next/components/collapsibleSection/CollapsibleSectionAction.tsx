"use client";

import { ChildrenPosition } from "@/types/ChildrenPosition";
import { JSX } from "react";

export type CollapsibleSectionActionProps = {
    _id?: string;
    title?: string;
    icon?: JSX.Element;
    onClick?: (_id?: string) => void;
    className?: string;
    titleClassName?: string;
    iconClassName?: string;
    type: ChildrenPosition;
}

export default function CollapsibleSectionAction({
    _id, title, icon, onClick, className, titleClassName, iconClassName
}: CollapsibleSectionActionProps) {
    return (
        <div className={title ? className : ''} onClick={() => onClick?.(_id)}>
            {title && <div className={titleClassName}>{title}</div>}
            {icon && <div className={iconClassName}>{icon}</div>}
        </div>
    );
}
