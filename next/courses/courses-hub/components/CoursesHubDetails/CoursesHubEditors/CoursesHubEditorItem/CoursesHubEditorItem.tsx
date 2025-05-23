"use client";

import { useTranslation } from "react-i18next";
import { CourseEditor } from "../../../../types/CourseEditor";
import { coursesHubEditorsPrefixTranslate, rolesPrefix } from "@/helpers/prefixes";
import styles from "./CoursesHubEditorItem.module.css";
import { Tag } from "@/components/Tag/Tag";
import { InfiniteSelector } from "@/components/InfiniteSelector/InifiniteSelector";
import { ItemSize } from "@/types/ItemSize";
import { LabeledAvatar } from "@/components/LabeledAvatar/LabeledAvatar";
import { useCallback, useEffect, useState } from "react";
import { getRolesFromScope } from "@/collections/Roles";
import { RoleScope } from "@/types/Role";
import { CourseEditorModalItem } from "@/courses/courses-hub/types/CourseEditorModalItem";
import { isEditorDisabled } from "@/courses/courses-hub/functions/isEditorDisabled";
import { EditorPermissions } from "@/courses/courses-hub/types/EditorPermissions";

type CoursesHubEditorItemProps = {
    editor: CourseEditorModalItem;
    setEditor?: (editor: CourseEditor) => void;
    size?: ItemSize;
    permissions?: EditorPermissions;
}

export const CoursesHubEditorItem = ({
    editor, setEditor,
    permissions,
    size = ItemSize.Little
}: CoursesHubEditorItemProps) => {
    const [roles, setRoles] = useState<{ value?: string | undefined; label: string; }[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>(editor.roles[0]);

    const { t } = useTranslation();

    useEffect(() => {
        const rolesFromCurrentScope = getRolesFromScope(RoleScope.Courses);
        if (rolesFromCurrentScope.length) {
            const newRoles: { value?: string | undefined; label: string; }[] =
                rolesFromCurrentScope
                    .map(r => ({
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
        setSelectedRole(editor.roles[0]);
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

    const getCurrentRoles = useCallback(
        (roles: { value?: string | undefined; label: string; }[], disabled?: boolean, permissions?: EditorPermissions) => {
            return disabled ? roles : roles.filter(r => r.value === undefined || !isEditorDisabled([r.value], permissions));
        },
        [JSON.stringify(editor)]
    );

    return (
        <LabeledAvatar
            item={{ value: editor._id, avatar: editor.avatar, label: editor.name }}
            size={size}
            child={(size) => {
                const currRoles = getCurrentRoles(roles, editor.disabled, permissions);
                return (size === ItemSize.Little
                    ? <Tag tag={formatRoleName(selectedRole)} size={size} />
                    : <InfiniteSelector
                        width='8rem'
                        onChange={handleRoleChange}
                        optionWidth='84.3%'
                        options={currRoles}
                        value={selectedRole}
                        endClassName={styles.selector}
                        disabled={editor.disabled}
                    />
                )
            }}
        />
    );
};