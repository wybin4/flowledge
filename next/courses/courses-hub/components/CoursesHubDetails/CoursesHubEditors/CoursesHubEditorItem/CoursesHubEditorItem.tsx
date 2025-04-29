"use client";

import { useTranslation } from "react-i18next";
import { CourseEditor } from "../../../../types/CourseEditor";
import { rolesPrefix } from "@/helpers/prefixes";
import styles from "./CoursesHubEditorItem.module.css";
import { Tag } from "@/components/Tag/Tag";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import { ItemSize } from "@/types/ItemSize";
import { LabeledAvatar } from "@/components/LabeledAvatar/LabeledAvatar";

type CoursesHubEditorItemProps = {
    editor: CourseEditor;
    size?: ItemSize;
}

export const CoursesHubEditorItem = ({ editor, size = ItemSize.Little }: CoursesHubEditorItemProps) => {
    const { t } = useTranslation();

    const role = editor.roles[0];

    return (
        <LabeledAvatar
            item={{ value: editor._id, avatar: editor.avatar, label: editor.name }}
            size={size}
            child={(size) => (size === ItemSize.Little
                ? <Tag tag={t(`${rolesPrefix}.${role}`)} size={size} />
                : <InfiniteSelector
                    width={8}
                    optionWidth={84.3}
                    options={[{ value: '1', label: 'testuser' }]}
                    value={t(`${rolesPrefix}.${role}`)}
                    endClassName={styles.selector}
                />
            )}
        />
    );
};