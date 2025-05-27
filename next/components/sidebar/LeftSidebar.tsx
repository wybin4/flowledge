"use client";

import styles from "./Sidebar.module.css";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";
import { apiIntegrationsPrefix, coursesHubPrefix, coursesListPrefix, courseTagsPrefix, permissionsPrefix, privateSettingsPrefix, profilePrefix, userSettingsPrefix, usersPrefix } from "@/helpers/prefixes";
import { clearTokensClient } from "@/auth/tokens";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import LeftSidebarIcon from "./LeftSidebarIcon/LeftSidebarIcon";
import { useIcon } from "@/hooks/useIcon";

const sidebarPermissions = [
    'view-private-settings',
    'view-tags',
    'edit-course',
    'view-all-users',
    'view-all-permissions',
    'view-integrations'
];

type LeftSidebarProps = {
    children: (isExpanded: boolean) => ReactNode;
};

export default function LeftSidebar({ children }: LeftSidebarProps) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebar('left');

    const [
        viewPrivateSettings,
        viewTags,
        editCourse,
        viewAllUsers,
        viewAllPermissions,
        viewIntegrations
    ] = usePermissions(sidebarPermissions);

    const router = useRouter();

    if (!hydrated) {
        return null;
    }

    return (
        <>
            <div
                className={cn(styles.left, isExpanded ? 'expandedLeftSidebar' : '', {
                    [styles.containerWhenExpanded]: isExpanded,
                    [styles.containerWhenCollapsed]: !isExpanded,
                })}
            >
                <div
                    className={cn(styles.item, 'leftSidebar', {
                        [styles.expanded]: isExpanded,
                        [styles.collapsed]: !isExpanded,
                    })}
                >
                    <LeftSidebarIcon name='logo' isRedirectable={false} isExpanded={isExpanded} />

                    <div className={styles.nav}>
                        <div>
                            <LeftSidebarIcon isExpanded={isExpanded} name={profilePrefix} />
                            {viewAllUsers && <LeftSidebarIcon isExpanded={isExpanded} name={usersPrefix} />}
                            <LeftSidebarIcon isExpanded={isExpanded} name={coursesListPrefix} />
                            {editCourse && <LeftSidebarIcon isExpanded={isExpanded} name={coursesHubPrefix} />}
                            {viewTags && <LeftSidebarIcon isExpanded={isExpanded} name={courseTagsPrefix} />}
                        </div>
                        <div>
                            <LeftSidebarIcon
                                name='resize'
                                isExpanded={isExpanded}
                                onClick={toggleSidebar}
                                className={cn(styles.toggleButton, styles.button, {
                                    [styles.toggledButton]: isExpanded,
                                })}
                                i18nAdditionalKey={isExpanded ? 'collapse' : 'expand'}
                                isRedirectable={false}
                            />
                            <LeftSidebarIcon isExpanded={isExpanded} name={userSettingsPrefix} />
                            {viewIntegrations && (
                                <LeftSidebarIcon isExpanded={isExpanded} name={apiIntegrationsPrefix} />
                            )}
                            {viewPrivateSettings && (
                                <LeftSidebarIcon isExpanded={isExpanded} name={privateSettingsPrefix} />
                            )}
                            {viewAllPermissions && (
                                <LeftSidebarIcon isExpanded={isExpanded} name={permissionsPrefix} />
                            )}
                            <LeftSidebarIcon
                                name='logout'
                                isExpanded={isExpanded}
                                onClick={() => {
                                    clearTokensClient();
                                    router.replace('/login');
                                }}
                                isRedirectable={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {children(isExpanded)}
        </>
    );
}
