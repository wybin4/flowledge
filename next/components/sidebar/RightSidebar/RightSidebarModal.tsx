"use client";

import styles from "../Sidebar.module.css";
import { useIcon } from "@/hooks/useIcon";
import { EnhancedItem, EnhancedItemAdditionalButton, EnhancedItemSettingKey } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import { ApiClient } from "@/types/ApiClient";
import { QueryParams } from "@/types/QueryParams";
import { TablePageMode } from "@/types/TablePageMode";

export type RightSidebarModalProps<T, U> = {
    prefix: string;
    apiPrefix?: string;
    queryParams?: QueryParams;
    mode: TablePageMode;
    _id?: string;
    settingKeys: EnhancedItemSettingKey[];
    apiClient: ApiClient<T>;
    transformItemToSave: (item: T) => U;
    createEmptyItem: () => T;
    onBackButtonClick?: () => void;
    additionalButtons: EnhancedItemAdditionalButton[];
};

export default function RightSidebarModal<T, U>({
    prefix, apiPrefix, queryParams, mode, _id, settingKeys, apiClient,
    transformItemToSave, createEmptyItem, onBackButtonClick, additionalButtons
}: RightSidebarModalProps<T, U>) {
    const closeIcon = useIcon('close');

    return (
        <EnhancedItem<T, U>
            prefix={prefix}
            apiPrefix={apiPrefix}
            queryParams={queryParams}
            mode={mode}
            _id={_id}
            settingKeys={settingKeys}
            apiClient={apiClient}
            transformItemToSave={transformItemToSave}
            createEmptyItem={createEmptyItem}
            backButton={{
                onBackButtonClick: onBackButtonClick,
                backButtonIcon: closeIcon,
                hasBackButtonText: false,
                backButtonStyles: styles.backButton
            }}
            containerStyles={styles.rightSidebarModal}
            additionalButtons={additionalButtons}
        />
    );
}
