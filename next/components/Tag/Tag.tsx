import styles from "./Tag.module.css";
import cn from "classnames";

type TagProps = {
    tag: string;
    size?: 'small' | 'medium';
};

export const Tag = ({ tag, size = 'medium' }: TagProps) => {
    return (
        <div className={cn(styles.tag, styles[size])}>
            {tag}
        </div>
    );
};
