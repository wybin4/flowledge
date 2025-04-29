import { CourseEditor } from "../../../../types/CourseEditor";
import styles from "./CoursesHubEditors.module.css";
import { CoursesHubEditorItem } from "../CoursesHubEditorItem/CoursesHubEditorItem";
import { ItemSize } from "@/types/ItemSize";

type CoursesHubEditorsProps = {
    editors: CourseEditor[];
    size?: ItemSize;
}

export const CoursesHubEditors = ({ editors, size = ItemSize.Little }: CoursesHubEditorsProps) => {
    return (
        <div className={styles.editorsContainer}>
            {editors.map((editor, index) => (
                <CoursesHubEditorItem key={index} editor={editor} size={size} />
            ))}
        </div>
    );
};