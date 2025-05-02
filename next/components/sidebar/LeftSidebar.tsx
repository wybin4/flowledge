"use client";

import styles from "./Sidebar.module.css";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";
import { apiIntegrationsPrefix, coursesHubPrefix, coursesListPrefix, courseTagsPrefix, permissionsPrefix, privateSettingsPrefix, profilePrefix, userSettingsPrefix } from "@/helpers/prefixes";
import LeftSidebarIcon from "./LeftSidebarIcon/LeftSidebarIcon";

export default function LeftSidebar({ children }: { children: (isExpanded: boolean) => ReactNode }) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebar('left');

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
                            <LeftSidebarIcon isExpanded={isExpanded} name={coursesListPrefix} />
                            <LeftSidebarIcon isExpanded={isExpanded} name={coursesHubPrefix} />
                            <LeftSidebarIcon isExpanded={isExpanded} name={courseTagsPrefix} />
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
                            <LeftSidebarIcon isExpanded={isExpanded} name={apiIntegrationsPrefix} />
                            <LeftSidebarIcon isExpanded={isExpanded} name={privateSettingsPrefix} />
                            <LeftSidebarIcon isExpanded={isExpanded} name={permissionsPrefix} />
                        </div>
                    </div>
                </div>
            </div>
            {children(isExpanded)}
        </>
    );
}
