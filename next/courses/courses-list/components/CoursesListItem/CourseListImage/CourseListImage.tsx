import { JSX } from "react";
import styles from "./CourseListImage.module.css";
import cn from 'classnames';
import { Image } from "@/components/Image/Image";

type CourseListImageProps = {
    imageUrl?: string;
    icon?: JSX.Element;
    title: string;
    size?: 'medium' | 'large' | 'xlarge';
}

export const CourseListImage = ({ imageUrl, icon, title, size = 'large' }: CourseListImageProps) => {
    if (icon) {
        return (
            <div className={cn(styles.image, styles.icon, styles[size])}>{icon}</div>
        );
    }

    return (
        <Image src={imageUrl} alt={title} className={cn(styles.image, styles[size])} />
    );
};
