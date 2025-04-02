"use client";

import styles from "./Sidebar.module.css";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";

type RightSidebarClassNames = {
    containerClassName: string;
    headerClassName: string;
    contentClassName: string;
};

type RightSidebarProps = {
    children: (isExpanded: boolean, onClick: () => void) => ReactNode;
    content: (classNames: RightSidebarClassNames) => ReactNode;
};

export default function RightSidebar({ children }: RightSidebarProps) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebar('right');

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
                    content(classNames)
                </div>
            </div>
            <div>{children(isExpanded, toggleSidebar)}</div>
        </>
    );
}
