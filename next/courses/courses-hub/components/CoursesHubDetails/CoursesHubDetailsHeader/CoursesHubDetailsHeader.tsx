"use client";

import styles from "./CoursesHubDetailsHeader.module.css";

type CoursesHubDetailsHeaderProps = {
    title: string;
    description?: string;
    action: string;
    onClick: () => void;
}

export const CoursesHubDetailsHeader = ({ title, description, action, onClick }: CoursesHubDetailsHeaderProps) => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.titleContainer}>
                <div className={styles.title}>{title}</div>
                {description && <div className={styles.description}>{description}</div>}
            </div>
            <div className={styles.action} onClick={onClick}>{action}</div>
        </div>
    );
};