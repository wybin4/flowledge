import { JSX } from "react";
import styles from "./CreateLessonVideoHeader.module.css";

type CreateLessonVideoHeaderProps = {
    title: string;
    description?: string;
    icon: JSX.Element;
};

export const CreateLessonVideoHeader = ({ title, description, icon }: CreateLessonVideoHeaderProps) => {
    return (
        <div className={styles.videoActionsHeader}>
            <div className={styles.videoActionsHeaderTitle}>
                <h3>{title}</h3>
                {description && (
                    <div
                        dangerouslySetInnerHTML={{ __html: description }}
                        className={styles.videoActionsHeaderDescription}
                    />
                )}
            </div>
            <div className={styles.videoActionsHeaderIcon}>
                {icon}
            </div>
        </div>
    );
};  
