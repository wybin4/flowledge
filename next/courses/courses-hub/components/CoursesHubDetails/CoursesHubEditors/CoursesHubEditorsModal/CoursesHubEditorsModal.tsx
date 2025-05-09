import { useTranslation } from "react-i18next";
import { CourseEditor } from "@/courses/courses-hub/types/CourseEditor";
import { useEffect, useState } from "react";
import { CoursesHubEditors } from "../CoursesHubEditors/CoursesHubEditors";
import styles from "./CoursesHubEditorsModal.module.css";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import cn from "classnames";
import { coursesHubEditorsPrefixApi, coursesHubEditorsPrefixTranslate, coursesHubPrefix } from "@/helpers/prefixes";
import { LabeledAvatar, LabeledAvatarItem } from "@/components/LabeledAvatar/LabeledAvatar";
import { ItemSize } from "@/types/ItemSize";
import { userApiClient } from "@/apiClient";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { UserGetResponse } from "@/dto/UserGetResponse";
import { setQueryParams } from "@/helpers/setQueryParams";

type CoursesHubEditorsModalProps = {
    editors: CourseEditor[];
    onCancel?: () => void;
    onSave: (editors: CourseEditor[]) => void;
    courseId: string;
};

export const CoursesHubEditorsModal = ({
    courseId,
    editors: initialEditors,
    onSave, onCancel
}: CoursesHubEditorsModalProps) => {
    const [editors, setEditors] = useState<CourseEditor[]>(initialEditors || []);
    const [users, setUsers] = useState<LabeledAvatarItem[]>([]);

    const pageSize = usePrivateSetting<number>('preview-page-size') ?? 5;
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { t } = useTranslation();

    const canSave =
        editors.length &&
        editors.every(editor => editor.roles.length) &&
        JSON.stringify(initialEditors) != JSON.stringify(editors);

    useEffect(() => {
        const excludedIds = editors.map(e => e._id);
        userApiClient.get<UserGetResponse[]>(
            `users.get${setQueryParams({
                pageSize, searchQuery, excludedIds, isSmall: true
            })}`
        ).then(users => {
            setUsers(users.map(u => ({
                value: u._id,
                label: u.name,
                avatar: u.avatar
            })))
        });
    }, [JSON.stringify(editors), searchQuery]);

    const handleSave = () => {
        if (!canSave) {
            return;
        }

        const processedEditors = editors.map(e => ({
            _id: e._id,
            roles: e.roles.filter(role => role !== null && role !== undefined)
        }));

        userApiClient.post(`${coursesHubEditorsPrefixApi}.update`, {
            courseId,
            editors: processedEditors
        });

        const filteredEditors = editors.filter(e =>
            e.roles.every(role => role !== null && role !== undefined)
        );
        onSave(filteredEditors);
        onCancel?.();
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h3 className={cn(styles.title, styles.negMt)}>{t(`${coursesHubEditorsPrefixTranslate}.add-editor`)}</h3>
                <InfiniteSelector
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    options={users}
                    changeable={false}
                    onChange={(newValue: any) => {
                        setEditors(editors => [...editors, {
                            _id: newValue.value,
                            name: newValue.label,
                            avatar: newValue.avatar,
                            roles: []
                        }]);
                    }}
                    formatOptionLabel={(option: any) => (
                        <LabeledAvatar
                            key={option.value}
                            item={option}
                        />
                    )}
                    endClassName={styles.editorSelector}
                    placeholder={`${coursesHubPrefix}.select-from-users-list`}
                    noOptionsPlaceholder={`${coursesHubEditorsPrefixTranslate}.no-users-for-editors`}
                />
                <h3 className={styles.title}>{t(`${coursesHubEditorsPrefixTranslate}.name`)}</h3>
                <CoursesHubEditors
                    editors={editors}
                    setEditors={setEditors}
                    size={ItemSize.Big}
                />
            </div>
            <div className={styles.actions}>
                <div className={styles.actionCancel} onClick={onCancel}>{t('cancel')}</div>
                <div onClick={handleSave} className={cn({
                    [styles.disabled]: !canSave
                })}>{t('save')}</div>
            </div>
        </div>
    );
};