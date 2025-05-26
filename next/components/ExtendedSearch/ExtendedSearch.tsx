"use client";

import { useIcon } from "@/hooks/useIcon";
import { useTranslation } from "react-i18next";
import { TablePageSearch } from "../TablePage/TablePage/TablePageSearch";
import cn from "classnames";
import { ChangeEvent } from "react";
import styles from "./ExtendedSearch.module.css";

type ExtendedSearchProps = {
    query: string;
    setQuery: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: ExtendedSearchType;
    className?: string;
    iconClassName?: string;
};

export enum ExtendedSearchType {
    Dark = 'dark',
    SemiDark = 'semiDark'
}

export const ExtendedSearch = ({
    query, setQuery, type = ExtendedSearchType.Dark,
    className, iconClassName
}: ExtendedSearchProps) => {
    const { t } = useTranslation();

    const searchIcon = useIcon('input-search');
    return (
        <TablePageSearch
            query={query}
            onChange={setQuery}
            placeholder={t('search')}
            icon={searchIcon}
            iconClassName={cn(styles.icon, iconClassName)}
            className={cn(styles.input, styles[type], className)}
        />
    );
};