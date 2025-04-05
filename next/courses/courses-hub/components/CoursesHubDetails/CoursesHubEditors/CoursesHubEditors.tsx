"use client";

import { useTranslation } from "react-i18next";
import { CourseEditor } from "../../../types/CourseEditor";
import { rolesPrefix } from "@/helpers/prefixes";
import styles from "./CoursesHubEditors.module.css";
import { Tag } from "@/components/Tag/Tag";

type CoursesHubEditorsProps = {
    editors: CourseEditor[];
}

export const CoursesHubEditors = ({ editors }: CoursesHubEditorsProps) => {
    const { t } = useTranslation();

    return (
        <>
            <div className={styles.editorsContainer}>
                {editors.map(editor => (
                    <div key={editor._id} className={styles.editorContainer}>
                        <img src={editor.avatar} alt={editor.name} className={styles.avatar} />
                        <div className={styles.editorInfo}>
                            <div className={styles.editorName}>{editor.name}</div>
                            <Tag tag={editor.roleNames.map(role => t(`${rolesPrefix}.${role}`)).join(', ')} size='small' />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};