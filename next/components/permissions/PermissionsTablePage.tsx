"use client";

import { getPermissionsPage, getTotalPermissionsCount, Permissions } from "@/collections/Permissions";
import { Roles } from "@/collections/Roles";
import { usePagination } from "@/hooks/usePagination";
import { IPermission } from "@/types/Permission";
import { TablePage } from "../tablePage/TablePage";
import { PermissionsHeader } from "./permissionsHeader/PermissionsHeader";
import { PermissionsItem } from "./permissionsItem/PermissionsItem";
import { getPrivateSetting } from "@/collections/PrivateSettings";
import { useState } from "react";
import { TablePageSearch } from "../tablePage/TablePageSearch";
import PageLayout from "../pageLayout/PageLayout";
import { apiClient } from "@/apiClient";

export const PermissionsTablePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = getPrivateSetting<number>('page-size') || 10;

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

    const roles = Roles.collection.find();
    const roleNames = roles.map(role => role._id);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setSearchQuery(e.target.value);
    };

    const handleAddRole = async (permissionId: string, roleId: string) => {
        try {
            await apiClient(`/permissions.toggle-role?id=${permissionId}&value=${roleId}`, {
                method: 'POST',
            });

        } catch (error) {
            console.error('Не удалось добавить роль:', error);
        }
    };

    return (
        <PageLayout
            name='permissions'
            type='block'
            headerChildren={<></>}
            headerInfo={`${totalCount}`}
            mainChildren={
                <>
                    <TablePageSearch query={searchQuery} onChange={handleSearchChange} placeholder='permissions.placeholder' />
                    <TablePage
                        header={<PermissionsHeader roles={roles} />}
                        body={data.map(permission => (
                            <PermissionsItem onClick={handleAddRole} key={permission._id} permission={permission} roles={roleNames} />
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