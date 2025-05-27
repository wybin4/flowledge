"use client";

import { DetailedHTMLProps, HTMLAttributes, ReactNode, memo } from "react";
import styles from "./LeftSidebarIcon.module.css";
import cn from 'classnames';
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IconKey, useIcon } from "@/hooks/useIcon";

interface LeftSidebarIconProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    isRedirectable?: boolean;
    i18nAdditionalKey?: string;
    name: IconKey;
    isExpanded: boolean;
    onClick?: () => void;
}

const LeftSidebarIcon = memo(({ isExpanded, name, isRedirectable = true, className, onClick, i18nAdditionalKey }: LeftSidebarIconProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation();
    let i18nKey = `sidebar.${name}`;
    const href = isRedirectable ? `/${name}` : undefined;
    const icon = useIcon(name);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }

        if (href) {
            router.push(href);
        }
    };

    if (i18nAdditionalKey) {
        i18nKey += `.${i18nAdditionalKey}`;
    }

    const isActive = href && new RegExp(`^${href}(/.*)?$`).test(pathname);

    return (
        <div className={cn(styles.container, className, {
            [styles.active]: isActive,
            [styles.expanded]: isExpanded,
            [styles.logo]: name === 'logo'
        })} onClick={handleClick}>
            <div>{icon}</div>
            {isExpanded && <div>{t(i18nKey)}</div>}
        </div>
    );
});

export default LeftSidebarIcon;
