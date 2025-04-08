"use client";

import { useState } from "react";
import { IconKey, useIcon } from "@/hooks/useIcon";
import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import CollapsibleSectionAction, { CollapsibleSectionActionProps } from "./CollapsibleSectionAction";
import { useTranslation } from "react-i18next";
import { ChildrenPosition } from "@/types/ChildrenPosition";

type CollapsibleSectionProps = {
    title: string;
    setTitle?: (title: string) => void;
    onTitleSave?: () => void;
    children?: React.ReactNode;
    actions?: CollapsibleSectionActionProps[];
    expandedByDefault: boolean;
    containerClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
    iconPrefix?: string;
    isEditTitle?: boolean;
    onClick?: () => void;
};

export default function CollapsibleSection({
    title, expandedByDefault, actions,
    children, iconPrefix = '',
    onTitleSave, setTitle, isEditTitle,
    containerClassName, headerClassName, contentClassName,
    onClick,
}: CollapsibleSectionProps) {
    const { t } = useTranslation();

    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const expandIcon = useIcon(`expand${iconPrefix}` as IconKey);

    const bottomActions = actions?.filter(action => action.type === ChildrenPosition.Bottom);
    const rightActions = actions?.filter(action => action.type === ChildrenPosition.Right);
    console.log(rightActions);
    return (
        <div
            className={cn(containerClassName, { [styles.edit]: isEditTitle })}
        >
            <div className={styles.header}>
                <div
                    className={cn(styles.headerContent, headerClassName)}
                    onClick={() => !isEditTitle && setIsExpanded((prev) => !prev)}
                >
                    <h3 className={cn({ [styles.titleEdit]: isEditTitle })}>{
                        isEditTitle ?
                            <input type='text' value={title} onChange={(e) => setTitle?.(e.target.value)} placeholder={t('type-here')} />
                            : title
                    }</h3>
                    {!isEditTitle && <div className={cn(styles.actionIcon, { [styles.expanded]: isExpanded })}>{expandIcon}</div>}
                    {isEditTitle && <div onClick={onTitleSave} className={cn(styles.actionIcon, styles.editIcon)}>+</div>}
                </div>
                <div className={styles.rightActions}>
                    {rightActions && rightActions.map((action, index) => (
                        <CollapsibleSectionAction key={index} {...action} />
                    ))}
                </div>
            </div>
            <div className={cn(contentClassName, { [styles.hidden]: !isExpanded })}>
                {children}
                {bottomActions && bottomActions.map((action, index) => (
                    <CollapsibleSectionAction key={index} {...action} />
                ))}
            </div>
        </div>
    );
}
