import { ItemSize } from "@/types/ItemSize";
import styles from "./LabeledAvatar.module.css";
import cn from "classnames";
import { ValueLabel } from "@/types/ValueLabel";
import { ReactNode } from "react";

export type LabeledAvatarItem = {
    avatar: string;
} & ValueLabel;

export type LabeledAvatarProps = {
    size?: ItemSize;
    item: LabeledAvatarItem;
    child?: (size: ItemSize) => ReactNode;
};

export const LabeledAvatar = ({ item, size = ItemSize.Little, child }: LabeledAvatarProps) => {
    const isSmall = size === ItemSize.Little;

    return (
        <div className={cn(styles.container, styles[size])}>
            <div className={styles.titleContainer}>
                <img src={item.avatar} alt={item.label} className={styles.avatar} />
                <div className={styles.info}>
                    <div className={styles.name}>{item.label}</div>
                    {!!isSmall && child?.(size)}
                </div>
            </div>
            {!isSmall && child?.(size)}
        </div>
    );
};
