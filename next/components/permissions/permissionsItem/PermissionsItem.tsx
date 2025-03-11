"use client";

import { IPermission } from "@/types/Permission";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import styles from "./PermissionsItem.module.css";

type PermissionsItemProps = {
    permission: IPermission;
    roles: string[];
    onClick: (permissionId: string, roleId: string) => void;
}

export const PermissionsItem = ({ permission, roles, onClick }: PermissionsItemProps) => {
    const { t } = useTranslation();
    return (
        <tr className={styles.container}>
            <td className={styles.first}>{t(`permissions.${permission._id}.name`)}</td>
            {roles.map(role => {
                return (
                    <td key={role} onClick={() => onClick(permission._id, role)} className={cn(styles.item, {
                        [styles.checked]: permission.roles.includes(role)
                    })}>ㅤ</td>
                )
            })}
        </tr>
    );
};