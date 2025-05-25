"use client";

import { useState } from "react";
import { TablePageSearch } from "../TablePage/TablePage/TablePageSearch";
import { useTranslation } from "react-i18next";
import styles from "./InfiniteSearch.module.css";
import cn from "classnames";
import { useIcon } from "@/hooks/useIcon";
import { useRouter, useSearchParams } from "next/navigation";

type InfiniteSearchProps = {
    type?: 'dark' | 'semiDark';
};

export const InfiniteSearch = ({ type = 'dark' }: InfiniteSearchProps) => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const { t } = useTranslation();

    const searchIcon = useIcon('input-search');

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);

        const params = new URLSearchParams(searchParams.toString());
        if (newQuery) {
            params.set('q', newQuery);
        } else {
            params.delete('q');
        }

        router.push(`?${params.toString()}`);
    };

    return (
        <TablePageSearch
            query={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('search')}
            icon={searchIcon}
            iconClassName={styles.icon}
            className={cn(styles.input, styles[type])}
        />
    );
};