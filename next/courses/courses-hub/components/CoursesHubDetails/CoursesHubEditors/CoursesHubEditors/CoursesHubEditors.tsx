import { CourseEditor } from "../../../../types/CourseEditor";
import styles from "./CoursesHubEditors.module.css";
import { CoursesHubEditorItem } from "../CoursesHubEditorItem/CoursesHubEditorItem";
import { ItemSize } from "@/types/ItemSize";
import { isEditorDisabled } from "@/courses/courses-hub/functions/isEditorDisabled";
import { EditorPermissions } from "@/courses/courses-hub/types/EditorPermissions";

type CoursesHubEditorsProps = {
    editors: CourseEditor[];
    setEditors?: (editors: CourseEditor[]) => void;
    size?: ItemSize;
    permissions?: EditorPermissions;
}

export const CoursesHubEditors = ({ editors, setEditors, size = ItemSize.Little, permissions }: CoursesHubEditorsProps) => {
    const handleEditorChange = (updatedEditor: CourseEditor) => {
        const updatedEditors = editors.map(editor =>
            editor.id === updatedEditor.id ? updatedEditor : editor
        );
        setEditors?.(updatedEditors);
    };

    return (
        <div className={styles.editorsContainer}>
            {editors.map((editor, index) => {
                const disabled = isEditorDisabled(editor.roles, permissions);
                return (
                    <CoursesHubEditorItem
                        key={index}
                        editor={{ ...editor, disabled }}
                        setEditor={handleEditorChange}
                        size={size}
                        permissions={permissions}
                    />
                )
            })}
        </div>
    );
};