"use client";

import styles from "./CoursesHubDetailsHeader.module.css";

type CoursesHubDetailsHeaderProps = {
    title: string;
    description?: string;
    action: string;
    onClick: () => void;
    isActionPermitted?: boolean;
}

export const CoursesHubDetailsHeader = ({ title, description, action, isActionPermitted = true, onClick }: CoursesHubDetailsHeaderProps) => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.titleContainer}>
                <div className={styles.title}>{title}</div>
                {description && <div className={styles.description}>{description}</div>}
            </div>
            {isActionPermitted && <div className={styles.action} onClick={onClick}>{action}</div>}
        </div>
    );
};