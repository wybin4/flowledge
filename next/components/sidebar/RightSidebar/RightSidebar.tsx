"use client";

import styles from "../Sidebar.module.css";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";
import { SidebarPosition } from "@/types/SidebarPosition";

type RightSidebarClassNames = {
    containerClassName: string;
    headerClassName: string;
    contentClassName: string;
};

type RightSidebarProps = {
    children: (isExpanded: boolean, onClick: () => void) => ReactNode;
    content: (classNames: RightSidebarClassNames) => ReactNode;
    useSidebarHook?: (position: SidebarPosition, initialState?: boolean) => ReturnType<typeof useSidebar>;
    expanded?: boolean;
};

export default function RightSidebar({ children, content, useSidebarHook, expanded }: RightSidebarProps) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebarHook ? useSidebarHook('right', expanded) : useSidebar('right');

    if (!hydrated) {
        return null;
    }

    const classNames: RightSidebarClassNames = {
        containerClassName: styles.container,
        headerClassName: styles.header,
        contentClassName: styles.content
    };

    return (
        <>
            <div
                className={cn(styles.right, {
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
                    {content(classNames)}
                </div>
            </div>
            <div>{children(isExpanded, toggleSidebar)}</div>
        </>
    );
}
