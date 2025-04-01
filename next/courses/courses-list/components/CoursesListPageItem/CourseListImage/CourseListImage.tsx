import styles from "./CourseListImage.module.css";
import cn from 'classnames';

type CourseListImageProps = {
    imageUrl: string;
    title: string;
    size?: 'medium' | 'large' | 'xlarge';
}

export const CourseListImage = ({ imageUrl, title, size = 'large' }: CourseListImageProps) => {
    return (
        <img className={cn(styles.image, styles[size])} src={imageUrl} alt={title} />
    );
};
