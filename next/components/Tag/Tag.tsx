import { ItemSize } from "@/types/ItemSize";
import styles from "./Tag.module.css";
import cn from "classnames";
import { JSX } from "react";

export enum TagType {
    Info = 'info',
    Neutral = 'neutral',
    Warning = 'warning',
}

type TagProps = {
    tag: string;
    size?: ItemSize;
    isHovered?: boolean;
    type?: TagType;
    icon?: JSX.Element;
};

export const Tag = ({
    tag, icon,
    isHovered = false,
    size = ItemSize.Little, type = TagType.Neutral
}: TagProps) => {
    return (
        <div className={cn(styles.tag, styles[size], styles[type], {
            [styles.hovered]: isHovered,
            [styles.tagWithIcon]: icon
        })}>
            {icon && <div className={styles.tagTitleIcon}>{icon}</div>}
            <div>{tag}</div>
        </div>
    );
};
