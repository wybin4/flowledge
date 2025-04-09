"use client";

import EnhancedItem, { EnhancedItemSettingKey, EnhancedItemAdditionalButton } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import styles from "../Sidebar.module.css";
import { useIcon } from "@/hooks/useIcon";
import { ApiClient } from "@/types/ApiClient";
import { QueryParams } from "@/types/QueryParams";
import { TablePageMode } from "@/types/TablePageMode";
import { memo } from "react";
import { Identifiable } from "@/types/Identifiable";

export type RightSidebarModalProps<T, U> = {
    prefix: string;
    apiPrefix?: string;
    queryParams?: QueryParams;
    mode: TablePageMode;
    _id?: string;
    useGetItemHook?: (callback: (item: T) => void) => (_id: string) => void;
    settingKeys: EnhancedItemSettingKey[];
    apiClient: ApiClient<T>;
    transformItemToSave: (item: T) => U;
    createEmptyItem: () => T;
    onBackButtonClick?: () => void;
    isBackWithRouter?: boolean;
    additionalButtons: EnhancedItemAdditionalButton[];
};

export const RightSidebarModal = <T extends Identifiable, U>({
    prefix, apiPrefix, queryParams, mode, _id, useGetItemHook, settingKeys, apiClient,
    transformItemToSave, createEmptyItem, onBackButtonClick, isBackWithRouter, additionalButtons
}: RightSidebarModalProps<T, U>) => {
    const closeIcon = useIcon('close');

    return (
        <EnhancedItem<T, U>
            prefix={prefix}
            apiPrefix={apiPrefix}
            queryParams={queryParams}
            mode={mode}
            _id={_id}
            useGetItemHook={useGetItemHook}
            settingKeys={settingKeys}
            apiClient={apiClient}
            transformItemToSave={transformItemToSave}
            createEmptyItem={createEmptyItem}
            backButton={{
                onBackButtonClick: onBackButtonClick,
                backButtonIcon: closeIcon,
                hasBackButtonText: false,
                backButtonStyles: styles.backButton,
                isBackWithRouter: isBackWithRouter
            }}
            containerStyles={styles.rightSidebarModal}
            additionalButtons={additionalButtons}
        />
    );
};

const RightSidebarModalComponent = memo(RightSidebarModal, (prevProps, nextProps) => {
    return prevProps._id === nextProps._id && prevProps.mode === nextProps.mode;
}) as typeof RightSidebarModal;

export default RightSidebarModalComponent;
