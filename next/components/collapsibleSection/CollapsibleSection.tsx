"use client";

import { JSX, ReactNode, useState } from "react";
import { IconKey, useIcon } from "@/hooks/useIcon";
import styles from "./CollapsibleSection.module.css";
import cn from "classnames";
import CollapsibleSectionAction, { CollapsibleSectionActionProps } from "./CollapsibleSectionAction";
import { useTranslation } from "react-i18next";
import { ChildrenPosition } from "@/types/ChildrenPosition";

export enum CollapsibleSectionTagType {
    Info = 'info',
    Warning = 'warning',
}

type CollapsibleSectionProps = {
    title: string;
    titleTags?: {
        title: string;
        type: CollapsibleSectionTagType;
    }[];
    setTitle?: (title: string) => void;
    onTitleSave?: () => void;
    children?: ReactNode;
    actions?: CollapsibleSectionActionProps[];
    expandedByDefault: boolean;
    containerClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
    iconPrefix?: string;
    isEditTitle?: boolean;
    validateTitle?: (title: string) => boolean;
    titleError?: string;
};

export default function CollapsibleSection({
    expandedByDefault, actions,
    children, iconPrefix = '',
    title, titleTags, onTitleSave, setTitle, isEditTitle,
    containerClassName, headerClassName, contentClassName,
    validateTitle, titleError
}: CollapsibleSectionProps) {
    const { t } = useTranslation();

    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const expandIcon = useIcon(`expand${iconPrefix}` as IconKey);

    const bottomActions = actions?.filter(action => action.type === ChildrenPosition.Bottom);
    const rightActions = actions?.filter(action => action.type === ChildrenPosition.Right);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle?.(e.target.value);
    };

    const handleSaveTitle = () => {
        if (validateTitle && validateTitle(title)) {
            onTitleSave?.();
        }
    };

    return (
        <div
            className={cn(containerClassName, { [styles.edit]: isEditTitle })}
        >
            <div className={styles.header}>
                <div
                    className={cn(styles.headerContent, headerClassName)}
                    onClick={() => !isEditTitle && setIsExpanded((prev) => !prev)}
                >
                    <h3 className={cn(styles.titleContainer, { [styles.titleEdit]: isEditTitle })}>
                        <div>{
                            isEditTitle ?
                                <input type='text' value={title} onChange={handleChangeTitle} placeholder={t('type-here')} />
                                : title
                        }</div>
                        {titleTags && titleTags.map((tag, index) => (
                            <div key={index} className={cn(styles.tag, styles[tag.type])}>
                                <div className={styles.tagTitle}>{tag.title}</div>
                            </div>
                        ))}
                    </h3>
                    {!isEditTitle && <div className={cn(styles.actionIcon, { [styles.expanded]: isExpanded })}>{expandIcon}</div>}
                    {isEditTitle && <div onClick={handleSaveTitle} className={cn(styles.actionIcon, styles.editIcon)}>+</div>}
                </div>
                <div className={styles.rightActions}>
                    {rightActions && rightActions.map((action, index) => (
                        <CollapsibleSectionAction key={index} {...action} />
                    ))}
                </div>
            </div>
            {titleError !== '' && <div className={styles.titleError}>{titleError}</div>}
            <div className={cn(contentClassName, { [styles.hidden]: !isExpanded })}>
                {children}
                {bottomActions && bottomActions.map((action, index) => (
                    <CollapsibleSectionAction key={index} {...action} />
                ))}
            </div>
        </div>
    );
}
