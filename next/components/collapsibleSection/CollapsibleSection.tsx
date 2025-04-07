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
    children?: React.ReactNode;
    actions?: CollapsibleSectionActionProps[];
    onEdit?: () => void;
    isOnlyEdit?: boolean;
    expandedByDefault: boolean;
    containerClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
    iconPrefix?: string;
};

export default function CollapsibleSection({
    title, expandedByDefault, actions, isOnlyEdit,
    children, iconPrefix = '',
    onEdit, setTitle,
    containerClassName, headerClassName, contentClassName,
}: CollapsibleSectionProps) {
    const [isEdit, setIsEdit] = useState<boolean>(isOnlyEdit ?? false);
    const { t } = useTranslation();

    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const expandIcon = useIcon(`expand${iconPrefix}` as IconKey);

    const bottomActions = actions?.filter(action => action.type === ChildrenPosition.Bottom);
    const rightActions = actions?.filter(action => action.type === ChildrenPosition.Right);

    return (
        <div
            className={cn(containerClassName, { [styles.edit]: isEdit })}
        >
            <div className={styles.header}>
                <div
                    className={cn(styles.headerContent, headerClassName)}
                    onClick={() => !isEdit && setIsExpanded((prev) => !prev)}
                >
                    <h3 className={cn({ [styles.titleEdit]: isEdit })}>{
                        isEdit ?
                            <input type='text' value={title} onChange={(e) => setTitle?.(e.target.value)} placeholder={t('type-here')} />
                            : title
                    }</h3>
                    {!isEdit && <div className={cn(styles.icon, { [styles.expanded]: isExpanded })}>{expandIcon}</div>}
                    {isEdit && <div onClick={onEdit} className={cn(styles.icon, styles.editIcon)}>+</div>}
                </div>
                <div className={styles.rightActions}>
                    {rightActions && rightActions.map((action) => (
                        <div>
                            {action.title}
                        </div>
                    ))}
                </div>
            </div>
            <div className={cn(contentClassName, { [styles.hidden]: !isExpanded })}>
                {children}
                {bottomActions && bottomActions.map((action) => (
                    <CollapsibleSectionAction key={action.title} {...action} />
                ))}
            </div>
        </div>
    );
}
