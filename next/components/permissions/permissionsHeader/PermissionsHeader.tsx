"use client";

import { IRole } from "@/types/Role";
import { useTranslation } from "react-i18next";
import styles from "./PermissionsHeader.module.css";

type PermissionsHeaderProps = {
    roles: IRole[];
}

export const PermissionsHeader = ({ roles }: PermissionsHeaderProps) => {
    const { t } = useTranslation();

    return (
        <thead>
            <tr>
                <th className={styles.name}>{t('name')}</th>
                {roles.map(role => <th key={role.name} className={styles.header}>{role.name}</th>)}
            </tr>
        </thead>
    );
};