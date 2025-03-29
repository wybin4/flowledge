"use client";

import styles from "./Sidebar.module.css";
import SidebarIcon from "./LeftSidebarIcon/leftSidebarIcon";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";
import { apiIntegrationsPrefix } from "@/helpers/prefixes";
export default function LeftSidebar({ children }: { children: (isExpanded: boolean) => ReactNode }) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebar('left');

    if (!hydrated) {
        return null;
    }

    return (
        <>
            <div
                className={cn(styles.left, {
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
                            <SidebarIcon isExpanded={isExpanded} name='profile' />
                            <SidebarIcon isExpanded={isExpanded} name='courses-list' />
                            <SidebarIcon isExpanded={isExpanded} name='courses-hub' />
                        </div>
                        <div>
                            <SidebarIcon
                                name='resize'
                                isExpanded={isExpanded}
                                onClick={toggleSidebar}
                                className={cn(styles.toggleButton, styles.button, {
                                    [styles.toggledButton]: isExpanded,
                                })}
                                i18nAdditionalKey={isExpanded ? 'collapse' : 'expand'}
                                isRedirectable={false}
                            />
                            <SidebarIcon isExpanded={isExpanded} name='user-settings' />
                            <SidebarIcon isExpanded={isExpanded} name={apiIntegrationsPrefix} />
                            <SidebarIcon isExpanded={isExpanded} name='private-settings' />
                            <SidebarIcon isExpanded={isExpanded} name='permissions' />
                        </div>
                    </div>
                </div>
            </div>
            {children(isExpanded)}
        </>
    );
}
