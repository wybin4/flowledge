"use client";

import { getPermissionsPage, getTotalPermissionsCount, Permissions } from "@/collections/Permissions";
import { usePagination } from "@/hooks/usePagination";
import { IPermission } from "@/types/Permission";
import { TablePage } from "../../components/tablePage/TablePage";
import { useState } from "react";
import { TablePageSearch } from "../../components/tablePage/TablePageSearch";
import PageLayout from "../../components/pageLayout/PageLayout";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";

export const ApiIntegrationsTablePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = usePrivateSetting<number>('search.page-size') || 10;

    const {
        data,
        currentPage,
        totalPages,
        totalCount,
        handleNextPage,
        handlePreviousPage,
    } = usePagination<IPermission>({
        itemsPerPage,
        getDataPage: getPermissionsPage,
        getTotalCount: getTotalPermissionsCount,
        searchQuery,
        setStateCallbacks: Permissions.pushCallback.bind(Permissions),
        removeStateCallbacks: Permissions.popCallback.bind(Permissions),
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <PageLayout
            name='api-integrations'
            type='block'
            headerChildren={<></>}
            headerInfo={`${totalCount}`}
            mainChildren={
                <>
                    <TablePageSearch query={searchQuery} onChange={handleSearchChange} placeholder='api-integrations.placeholder' />
                    <TablePage
                        header={<></>}
                        body={data.map(permission => (
                            <></>
                        ))}
                        pagination={{
                            totalCount,
                            currentPage,
                            totalPages,
                            handleNextPage,
                            handlePreviousPage,
                        }}
                    />
                </>
            }
        />
    );
};