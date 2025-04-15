import { JSX } from "react";
import styles from "./CreateLessonDraftHeader.module.css";

type CreateLessonDraftHeaderProps = {
    title: string;
    description?: string;
    icon: JSX.Element;
};

export const CreateLessonDraftHeader = ({ title, description, icon }: CreateLessonDraftHeaderProps) => {
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
