"use client";

import { memo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SettingsTab.module.css";
import cn from "classnames";
import { usePathname } from "next/navigation";
import useAddSegment from "@/hooks/useAddSegment";
import { IconKey, useIcon } from "@/hooks/useIcon";

type SettingsTabProps = {
    name: string;
    index: number;
    label: string;
}

export const SettingsTab = memo(({ index, name, label }: SettingsTabProps) => {
    const { t } = useTranslation();
    const pathname = usePathname();

    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const { modifyLastSegment } = useAddSegment();

    const icon = useIcon(name as IconKey);
   
    return (
        <div className={cn(styles.container, {
            [styles.active]: name == lastSegment
        })} onClick={() => modifyLastSegment(name)}>
            {icon && <div className={cn(styles.icon, {
                [styles.blue]: index % 3 === 0,
                [styles.green]: index % 3 === 1,
                [styles.gray]: index % 3 === 2
            })}>{icon}</div>}
            <div>{t(label)}</div>
        </div>
    );
});
