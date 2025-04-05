"use client";

export type CollapsibleSectionActionProps = {
    title: string;
    onClick: () => void;
    className?: string;
    titleClassName?: string;
}

export default function CollapsibleSectionAction({
    title, onClick, className, titleClassName
}: CollapsibleSectionActionProps) {
    return (
        <div className={className} onClick={onClick}>
            <div className={titleClassName}>{title}</div>
        </div>
    );
}
