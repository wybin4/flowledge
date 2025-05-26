"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExtendedSearch } from "../ExtendedSearch/ExtendedSearch";
import styles from "./InfiniteSearch.module.css";

export const InfiniteSearch = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

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
        <ExtendedSearch
            query={searchQuery}
            setQuery={handleSearchChange}
            iconClassName={styles.icon}
        />
    );
};