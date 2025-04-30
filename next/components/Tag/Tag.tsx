import { ItemSize } from "@/types/ItemSize";
import styles from "./Tag.module.css";
import cn from "classnames";

type TagProps = {
    tag: string;
    size?: ItemSize;
    isHovered?: boolean;
};

export const Tag = ({ tag, isHovered = true, size = ItemSize.Medium }: TagProps) => {
    return (
        <div className={cn(styles.tag, styles[size], {
            [styles.hovered]: isHovered
        })}>
            {tag}
        </div>
    );
};
