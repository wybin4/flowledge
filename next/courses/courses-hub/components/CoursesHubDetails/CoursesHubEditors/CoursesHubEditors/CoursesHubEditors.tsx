import { CourseEditor } from "../../../../types/CourseEditor";
import styles from "./CoursesHubEditors.module.css";
import { CoursesHubEditorItem } from "../CoursesHubEditorItem/CoursesHubEditorItem";
import { ItemSize } from "@/types/ItemSize";

type CoursesHubEditorsProps = {
    editors: CourseEditor[];
    setEditors?: (editors: CourseEditor[]) => void;
    size?: ItemSize;
}

export const CoursesHubEditors = ({ editors, setEditors, size = ItemSize.Little }: CoursesHubEditorsProps) => {
    const handleEditorChange = (updatedEditor: CourseEditor) => {
        const updatedEditors = editors.map(editor =>
            editor._id === updatedEditor._id ? updatedEditor : editor
        );
        setEditors?.(updatedEditors);
    };
   
    return (
        <div className={styles.editorsContainer}>
            {editors.map((editor, index) => (
                <CoursesHubEditorItem
                    key={index}
                    editor={editor}
                    setEditor={handleEditorChange}
                    size={size}
                />
            ))}
        </div>
    );
};