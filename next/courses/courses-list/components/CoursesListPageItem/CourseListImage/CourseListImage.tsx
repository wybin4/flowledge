import styles from "./CourseListImage.module.css";

type CourseListImageProps = {
    imageUrl: string;
    title: string;
}

export const CourseListImage = ({ imageUrl, title }: CourseListImageProps) => {
    return (
        <img className={styles.image} src={imageUrl} alt={title} />
    );
};
