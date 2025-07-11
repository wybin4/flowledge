"use client";

import EnhancedItem, { EnhancedItemProps } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/EnhancedItem";
import styles from "../Sidebar.module.css";
import { useIcon } from "@/hooks/useIcon";
import { memo } from "react";
import { Identifiable } from "@/types/Identifiable";
import { areEnhancedItemPropsEqual } from "@/components/TablePage/EnhancedTablePage/EnhancedItem/areEnhancedItemPropsEqual";

export type RightSidebarModalProps<T, U> = Omit<EnhancedItemProps<T, U>, 'backButton'> & {
    onBackButtonClick?: () => void;
};

export const RightSidebarModal = <T extends Identifiable, U>({ onBackButtonClick, isBackWithRouter, ...props }: RightSidebarModalProps<T, U>) => {
    const closeIcon = useIcon('close');

    return (
        <EnhancedItem<T, U>
            {...props}
            isBackWithRouter={isBackWithRouter}
            backButton={{
                onBackButtonClick: onBackButtonClick,
                backButtonIcon: closeIcon,
                hasBackButtonText: false,
                backButtonStyles: styles.backButton,
                isBackWithRouter
            }}
            containerStyles={styles.rightSidebarModal}
        />
    );
};

const RightSidebarModalComponent = memo(RightSidebarModal, (prevProps, nextProps) => {
    return areEnhancedItemPropsEqual(prevProps, nextProps)
}) as typeof RightSidebarModal;

export default RightSidebarModalComponent;
