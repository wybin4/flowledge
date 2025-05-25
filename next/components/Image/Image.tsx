import styles from "./Image.module.css";
import cn from "classnames";

type AvatarProps = {
    src?: string;
    alt: string;
    className?: string;
};

export const Image = ({ src, alt, className }: AvatarProps) => {
    return (
        <div>
            {!src && <div className={cn(styles.alt, className)}>{alt.charAt(0).toUpperCase()}</div>}
            {!!src && <img src={src} className={cn(styles.img, className)} />}
        </div>
    );
};