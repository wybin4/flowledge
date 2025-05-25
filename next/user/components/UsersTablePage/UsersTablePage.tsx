"use client";

import { userApiClient } from "@/apiClient";
import { getRolesFromScope, getRolesFromScopes } from "@/collections/Roles";
import { CRUDTablePage } from "@/components/TablePage/CRUDTablePage/CRUDTablePage";
import { getDataPageWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getDataPageWithApi";
import { getTotalCountWithApi } from "@/components/TablePage/EnhancedTablePage/functions/getTotalCountWithApi";
import { EnhancedItemType } from "@/components/TablePage/EnhancedTablePage/types/EnhancedItemTypes";
import { rolesPrefix, usersPrefix } from "@/helpers/prefixes";
import { usePermission } from "@/hooks/usePermission";
import { RoleScope } from "@/types/Role";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { createUsersTableHeader } from "@/user/functions/createUsersTableHeader";
import { mapUsersToTable } from "@/user/functions/mapUsersToTable";
import { UserItem } from "@/user/types/UserItem";
import { UserTableItem } from "@/user/types/UserTableItem";
import { UserToSave } from "@/user/types/UserToSave";
import { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const UsersTablePage = ({ mode }: { mode?: TablePageMode }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
    const usersRolesFromCurrentScope = getRolesFromScope(RoleScope.Users);
    const coursesRolesFromCurrentScope = getRolesFromScopes([RoleScope.Users, RoleScope.Courses]);
    const rolesFromCurrentScope = [...usersRolesFromCurrentScope, ...coursesRolesFromCurrentScope];

    const { t } = useTranslation();

    const getHeaderItems = (
        t: TFunction, setSortQuery: (query: string) => void
    ) => createUsersTableHeader(
        t, (name, position) => {
            const newSortQuery = position ? `${name}:${position}` : '';
            setSortQuery(newSortQuery);
        }
    );

    const isPermitted = usePermission('manage-users');

    return (
        <CRUDTablePage<UserItem, UserToSave, UserTableItem>
            prefix={usersPrefix}
            apiClient={userApiClient}
            permissions={{
                isCreationPermitted: isPermitted,
                isEditionPermitted: isPermitted,
                isDeletionPermitted: isPermitted
            }}
            hasDeleteDescription={false}
            queryParams={{ isSmall: false }}
            getDataPageFunctions={{
                getDataPage: (prefix, params) => getDataPageWithApi(
                    prefix, userApiClient, { ...params, queryParams: { isSmall: false } }
                ),
                getTotalCount: (prefix, params) => getTotalCountWithApi(prefix, userApiClient, params),
            }}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            mode={mode}
            settingKeys={[
                { name: 'avatar', types: [SettingType.InputImage] },
                { name: 'name', types: [SettingType.InputText] },
                { name: 'username', types: [SettingType.InputText] },
                { name: 'password', types: [SettingType.InputPassword] },
                {
                    name: 'roles', types: [SettingType.SelectorInfiniteMultiple],
                    additionalProps: {
                        prefix: usersPrefix,
                        selectedKey: 'roles',
                        options: rolesFromCurrentScope.map(
                            role => ({ value: role._id, label: t(`${rolesPrefix}.${role._id}`) })
                        )
                    }
                },
                { name: 'active', types: [SettingType.Radio], additionalProps: { withWrapper: false } },
            ]}
            transformItemToSave={(item) => {
                const { name, username, avatar, roles, active, password } = item;
                const body = {
                    name, username, avatar, roles, active, password
                };
                return body;
            }}
            createEmptyItem={() => ({
                _id: "",
                name: "",
                username: "",
                avatar: "",
                roles: [],
                active: true
            })}
            getHeaderItems={getHeaderItems}
            transformData={mapUsersToTable}
            itemKeys={[
                { name: 'avatar', type: EnhancedItemType.Image },
                { name: 'name', type: EnhancedItemType.Text },
                { name: 'username', type: EnhancedItemType.Text },
                { name: 'roles', type: EnhancedItemType.Text },
                { name: 'status', type: EnhancedItemType.Text },
            ]}
        />
    );
};