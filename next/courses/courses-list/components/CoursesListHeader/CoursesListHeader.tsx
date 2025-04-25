import styles from "./CoursesListHeade.module.css";

type CoursesListHeaderProps = {
    title: string;
    count: number;
};

export const CoursesListHeader = ({ title, count }: CoursesListHeaderProps) => {
    return (
        <div className={styles.container}>
            <h3>{title}</h3>
            <div>{count}</div>
        </div>
    );
};
