"use client";

import { getPermissionsPage, getTotalPermissionsCount, Permissions } from "@/collections/Permissions";
import { Roles } from "@/collections/Roles";
import { usePagination } from "@/hooks/usePagination";
import { IPermission } from "@/types/Permission";
import { TablePage } from "../TablePage/TablePage/TablePage";
import { PermissionsItem } from "./permissionsItem/PermissionsItem";
import { useState } from "react";
import { TablePageSearch } from "../TablePage/TablePage/TablePageSearch";
import PageLayout from "../PageLayout/PageLayout";
import { userApiClient } from "@/apiClient";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { TablePageHeader } from "../TablePage/TablePageHeader/TablePageHeader";

export const PermissionsTablePage = () => {
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
        getDataPageHook: {
            getDataPage: getPermissionsPage,
            getTotalCount: getTotalPermissionsCount
        },
        searchQuery,
        setStateCallbacks: Permissions.pushCallback.bind(Permissions),
        removeStateCallbacks: Permissions.popCallback.bind(Permissions),
    });

    const roles = Roles.collection.find();
    const roleNames = roles.map(role => role._id);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleAddRole = async (permissionId: string, roleId: string) => {
        try {
            await userApiClient({
                url: `permissions.toggle-role?id=${permissionId}&value=${roleId}`,
                options: { method: 'POST' }
            });

        } catch (error) {
            console.error('Не удалось добавить роль:', error);
        }
    };

    return (
        <PageLayout
            name='permissions'
            type='block'
            headerInfo={`${totalCount}`}
            mainChildren={
                <>
                    <TablePageSearch query={searchQuery} onChange={handleSearchChange} placeholder='permissions.placeholder' />
                    <TablePage
                        header={<TablePageHeader title='permissions.name' items={roleNames.map(name => ({ name }))} />}
                        body={data.map(permission => (
                            <PermissionsItem
                                onClick={handleAddRole}
                                key={permission._id}
                                permission={permission}
                                roles={roleNames}
                            />
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