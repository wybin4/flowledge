"use client";

import { useTranslation } from "react-i18next";
import { CourseEditor } from "../../../../types/CourseEditor";
import { coursesHubEditorsPrefixTranslate, rolesPrefix } from "@/helpers/prefixes";
import styles from "./CoursesHubEditorItem.module.css";
import { Tag } from "@/components/Tag/Tag";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import { ItemSize } from "@/types/ItemSize";
import { LabeledAvatar } from "@/components/LabeledAvatar/LabeledAvatar";
import { useEffect, useState } from "react";
import { getRolesFromScope } from "@/collections/Roles";
import { RoleScope } from "@/types/Role";

type CoursesHubEditorItemProps = {
    editor: CourseEditor;
    setEditor?: (editor: CourseEditor) => void;
    size?: ItemSize;
}

export const CoursesHubEditorItem = ({ editor, setEditor, size = ItemSize.Little }: CoursesHubEditorItemProps) => {
    const [roles, setRoles] = useState<{ value?: string | undefined; label: string; }[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>(editor.roles[0]);

    const { t } = useTranslation();

    useEffect(() => {
        const rolesFromCurrentScope = getRolesFromScope(RoleScope.Courses);
        if (rolesFromCurrentScope.length) {
            const newRoles: { value?: string | undefined; label: string; }[] = rolesFromCurrentScope.map(r => ({
                value: r._id, label: formatRoleName(r._id)
            }));
            if (selectedRole) {
                newRoles.push({
                    value: undefined,
                    label: t(`${coursesHubEditorsPrefixTranslate}.remove-roles`)
                });
            }
            setRoles(newRoles);
        }
    }, [editor.roles[0]]);

    const formatRoleName = (name?: string) => {
        return name ? t(`${rolesPrefix}.${name}`) : '';
    }

    const handleRoleChange = (newValue: any) => {
        const newRole = newValue.value;
        setSelectedRole(newRole);
        setEditor?.({
            ...editor,
            roles: [newRole]
        });
    };

    return (
        <LabeledAvatar
            item={{ value: editor._id, avatar: editor.avatar, label: editor.name }}
            size={size}
            child={(size) => (size === ItemSize.Little
                ? <Tag tag={formatRoleName(selectedRole)} size={size} isHovered={false} />
                : <InfiniteSelector
                    width={8}
                    onChange={handleRoleChange}
                    optionWidth={84.3}
                    options={roles}
                    value={selectedRole}
                    endClassName={styles.selector}
                />
            )}
        />
    );
};