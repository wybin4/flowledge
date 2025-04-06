import { JSX } from "react";
import styles from "./LessonItemHeader.module.css";

type LessonItemHeaderProps = {
    title: string;
    description?: string;
    icon: JSX.Element;
};

export const LessonItemHeader = ({ title, description, icon }: LessonItemHeaderProps) => {
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
