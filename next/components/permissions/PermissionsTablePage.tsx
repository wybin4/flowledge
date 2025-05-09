"use client";

import { Permissions } from "@/collections/Permissions";
import { Roles } from "@/collections/Roles";
import { IPermission } from "@/types/Permission";
import { TablePage } from "../TablePage/TablePage/TablePage";
import { PermissionsItem } from "./permissionsItem/PermissionsItem";
import { useState } from "react";
import { TablePageSearch } from "../TablePage/TablePage/TablePageSearch";
import PageLayout from "../PageLayout/PageLayout";
import { userApiClient } from "@/apiClient";
import { TablePageHeader } from "../TablePage/TablePageHeader/TablePageHeader";
import { useEnhancedPagination } from "@/hooks/useEnhancedPagination";
import { permissionsPrefix, rolesPrefix } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/hooks/usePermission";

export const PermissionsTablePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const {
        data,
        currentPage,
        totalPages,
        totalCount,
        handleNextPage,
        handlePreviousPage,
    } = useEnhancedPagination<IPermission>({
        apiPrefix: permissionsPrefix,
        getDataPageFunctions: {
            getDataPage: (_, props) => Permissions.getPage(props),
            getTotalCount: (_, props) => Permissions.getTotalCount(props)
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
            await userApiClient.post(
                `${permissionsPrefix}.toggle-role?id=${permissionId}&value=${roleId}`,
                {}
            );
        } catch (error) {
            console.error('Не удалось добавить роль:', error);
        }
    };

    const isEditionPermitted = usePermission('manage-permissions');

    return (
        <PageLayout
            name={permissionsPrefix}
            type='block'
            headerProps={{
                headerInfo: `${totalCount}`
            }}
            mainChildren={
                <>
                    <TablePageSearch
                        query={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={`${permissionsPrefix}.placeholder`}
                    />
                    <TablePage
                        header={
                            <TablePageHeader
                                title={`${permissionsPrefix}.name`}
                                items={roleNames.map(name => ({ name: t(`${rolesPrefix}.${name}`) }))}
                            />
                        }
                        body={data.map(permission => (
                            <PermissionsItem
                                onClick={handleAddRole}
                                key={permission._id}
                                permission={permission}
                                roles={roleNames}
                                isEditable={isEditionPermitted}
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