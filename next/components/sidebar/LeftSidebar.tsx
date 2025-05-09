"use client";

import styles from "./Sidebar.module.css";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";
import { apiIntegrationsPrefix, coursesHubPrefix, coursesListPrefix, courseTagsPrefix, permissionsPrefix, privateSettingsPrefix, profilePrefix, userSettingsPrefix, usersPrefix } from "@/helpers/prefixes";
import LeftSidebarIcon from "./LeftSidebarIcon/LeftSidebarIcon";
import { usePermission } from "@/hooks/usePermission";
import { clearTokensClient } from "@/auth/tokens";
import { useRouter } from "next/navigation";

export default function LeftSidebar({ children }: { children: (isExpanded: boolean) => ReactNode }) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebar('left');

    const viewPrivateSettings = usePermission('view-private-settings');
    const viewTags = usePermission('view-tags');
    const viewAllCourses = usePermission('view-all-courses');
    const viewAllUsers = usePermission('view-all-users');
    const viewAllPermissions = usePermission('view-all-permissions');
    const viewIntegrations = usePermission('view-integrations');

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
                    className={cn(styles.item, {
                        [styles.expanded]: isExpanded,
                        [styles.collapsed]: !isExpanded,
                    })}
                >
                    <h2>EF</h2>

                    <div className={styles.nav}>
                        <div>
                            <LeftSidebarIcon isExpanded={isExpanded} name={profilePrefix} />
                            {viewAllUsers && <LeftSidebarIcon isExpanded={isExpanded} name={usersPrefix} />}
                            <LeftSidebarIcon isExpanded={isExpanded} name={coursesListPrefix} />
                            {viewAllCourses && <LeftSidebarIcon isExpanded={isExpanded} name={coursesHubPrefix} />}
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
