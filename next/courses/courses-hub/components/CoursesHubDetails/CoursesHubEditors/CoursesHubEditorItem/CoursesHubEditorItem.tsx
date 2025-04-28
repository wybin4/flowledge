"use client";

import { useTranslation } from "react-i18next";
import { CourseEditor } from "../../../../types/CourseEditor";
import { rolesPrefix } from "@/helpers/prefixes";
import styles from "./CoursesHubEditorItem.module.css";
import { Tag } from "@/components/Tag/Tag";
import cn from "classnames";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import { InputBoxWrapper } from "@/components/InputBox/InputBoxWrapper";

type CoursesHubEditorItemProps = {
    editor: CourseEditor;
    isSmall?: boolean;
}

export const CoursesHubEditorItem = ({ editor, isSmall = true }: CoursesHubEditorItemProps) => {
    const { t } = useTranslation();
    const role = editor.roles[0];

    return (
        <div className={cn(styles.container, { [styles.big]: !isSmall })}>
            <div className={styles.titleContainer}>
                <img src={editor.avatar} alt={editor.name} className={styles.avatar} />
                <div className={styles.info}>
                    <div className={styles.name}>{editor.name}</div>
                    {isSmall && <Tag tag={t(`${rolesPrefix}.${role}`)} size='small' />}
                </div>
            </div>
            {!isSmall &&
                <InputBoxWrapper className={styles.selectorContainer}>
                    <InfiniteSelector value={t(`${rolesPrefix}.${role}`)} endClassName={styles.selector} />
                </InputBoxWrapper>
            }
        </div >
    );
};