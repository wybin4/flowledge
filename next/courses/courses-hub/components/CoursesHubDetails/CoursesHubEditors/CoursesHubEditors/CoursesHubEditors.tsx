import { CourseEditor } from "../../../../types/CourseEditor";
import styles from "./CoursesHubEditors.module.css";
import { CoursesHubEditorItem } from "../CoursesHubEditorItem/CoursesHubEditorItem";

type CoursesHubEditorsProps = {
    editors: CourseEditor[];
    isSmall?: boolean;
}

export const CoursesHubEditors = ({ editors, isSmall = true }: CoursesHubEditorsProps) => {
    return (
        <div className={styles.editorsContainer}>
            {editors.map((editor, index) => (
                <CoursesHubEditorItem key={index} editor={editor} isSmall={isSmall} />
            ))}
        </div>
    );
};