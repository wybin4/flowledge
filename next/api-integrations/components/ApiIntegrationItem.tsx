"use client";

import { ApiIntegration, ApiIntegrationEntity } from "../types/ApiIntegration";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";
import { integrationApiClient, neuralApiClient } from "@/apiClient";
import EnhancedItem from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { ApiIntegrationToSave } from "../types/ApiIntegrationToSave";
import { fakeUser } from "@/helpers/fakeUser";
import { usePermission } from "@/hooks/usePermission";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useTranslation } from "react-i18next";

interface ApiIntegrationItemProps {
    mode: TablePageMode;
    _id?: string;
}

export const ApiIntegrationItem = ({ mode, _id }: ApiIntegrationItemProps) => {
    const isPermitted = usePermission('manage-integrations');
    const { t } = useTranslation();

    return (
        <EnhancedItem<ApiIntegration, ApiIntegrationToSave>
            prefix={apiIntegrationsPrefix}
            mode={mode}
            permissions={{
                isEditionPermitted: isPermitted,
                isDeletionPermitted: isPermitted
            }}
            _id={_id}
            settingKeys={[
                { name: 'enabled', types: [SettingType.Radio] },
                { name: 'title', types: [SettingType.InputText] },
                { name: 'secret', types: [SettingType.InputPassword] },
                { name: 'script', types: [SettingType.Code] },
                {
                    name: 'entity', hasDescription: true, types: [SettingType.SelectorInfinite],
                    additionalProps: {
                        options: [
                            {
                                label: t(`${apiIntegrationsPrefix}.survey`),
                                value: ApiIntegrationEntity.Survey
                            },
                        ]
                    }
                }
            ]}
            apiClient={integrationApiClient}
            transformItemToSave={(item) => {
                const { name, secret, script, enabled } = item;
                const body = { name, secret, script, u: fakeUser, enabled }; // TODO!!!!!
                return body;
            }}
            backButton={{
                hasBackButtonIcon: true,
                type: ChildrenPosition.Left
            }}
            createEmptyItem={() => ({
                _id: "",
                name: "",
                secret: "",
                script: "",
                u: {
                    _id: "",
                    username: ""
                },
                createdAt: "",
                updatedAt: "",
                enabled: false,
                entity: ApiIntegrationEntity.Survey
            })}
            hasDeleteDescription={false}
        />
    );
};