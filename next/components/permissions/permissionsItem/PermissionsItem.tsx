"use client";

import { IPermission } from "@/types/Permission";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import styles from "./PermissionsItem.module.css";

type PermissionsItemProps = {
    permission: IPermission;
    roles: string[];
    onClick: (permissionId: string, roleId: string) => void;
    isEditable: boolean;
}

export const PermissionsItem = ({ permission, roles, onClick, isEditable }: PermissionsItemProps) => {
    const { t } = useTranslation();
    return (
        <tr className={cn(styles.container, {
            [styles.pointer]: isEditable
        })}>
            <td className={styles.first}>{t(`permissions.${permission._id}.name`)}</td>
            {roles.map(role => {
                return (
                    <td
                        key={role}
                        onClick={() => isEditable ? onClick(permission._id, role) : undefined}
                        className={cn(styles.item, {
                            [styles.checked]: permission.roles.includes(role)
                        })}
                    >ㅤ</td>
                )
            })}
        </tr>
    );
};