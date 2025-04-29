import { useTranslation } from "react-i18next";
import { CourseEditor } from "@/courses/courses-hub/types/CourseEditor";
import { useState } from "react";
import { CoursesHubEditors } from "../CoursesHubEditors/CoursesHubEditors";
import styles from "./CoursesHubEditorsModal.module.css";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import cn from "classnames";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { LabeledAvatar } from "@/components/LabeledAvatar/LabeledAvatar";
import { ItemSize } from "@/types/ItemSize";

type CoursesHubEditorsModalProps = {
    editors: CourseEditor[];
    onCancel?: () => void;
};

export const CoursesHubEditorsModal = ({ editors: initialEditors, onCancel }: CoursesHubEditorsModalProps) => {
    const [editors, setEditors] = useState<CourseEditor[]>(initialEditors || []);

    const { t } = useTranslation();

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h3 className={cn(styles.title, styles.negMt)}>{t(`${coursesHubPrefix}.add-editor`)}</h3>
                <InfiniteSelector
                    value={'2'}
                    options={editors.map(editor => ({
                        value: editor._id,
                        label: editor.name,
                        avatar: editor.avatar
                    }))}
                    formatOptionLabel={(option: any) => (
                        <LabeledAvatar
                            key={option.value}
                            item={option}
                        />
                    )}
                    endClassName={styles.editorSelector}
                    placeholder={t(`${coursesHubPrefix}.select-from-users-list`)}
                />
                <h3 className={styles.title}>{t(`${coursesHubPrefix}.editors`)}</h3>
                <CoursesHubEditors editors={editors} size={ItemSize.Big} />
            </div>
            <div className={styles.actions}>
                <div className={styles.actionCancel} onClick={() => {
                    onCancel?.();
                    setEditors(initialEditors);
                }}>{t('cancel')}</div>
                <div>{t('save')}</div>
            </div>
        </div>
    );
};