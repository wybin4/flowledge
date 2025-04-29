import { ItemSize } from "@/types/ItemSize";
import styles from "./Tag.module.css";
import cn from "classnames";

type TagProps = {
    tag: string;
    size?: ItemSize;
};

export const Tag = ({ tag, size = ItemSize.Medium }: TagProps) => {
    return (
        <div className={cn(styles.tag, styles[size])}>
            {tag}
        </div>
    );
};
