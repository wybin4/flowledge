"use client";

import styles from "./Sidebar.module.css";
import cn from "classnames";
import { useSidebar } from "@/hooks/useSidebar";
import { ReactNode } from "react";
import CollapsibleSection from "../collapsibleSection/CollapsibleSection";

export default function RightSidebar(
    { children }: { children: (isExpanded: boolean, onClick: () => void) => ReactNode }
) {
    const { isExpanded, hydrated, toggleSidebar } = useSidebar('right');

    if (!hydrated) {
        return null;
    }

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
                    <div style={{ height: '5.5625rem' }}></div>
                    <div style={{ overflowY: 'scroll', height: 'max-content' }}>
                        <CollapsibleSection title='основные понятия' expandedByDefault={true}>
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='проектирование по' expandedByDefault={false}>
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='классические методы' expandedByDefault={false}>
                            дети
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
            <div>{children(isExpanded, toggleSidebar)}</div>
        </>
    );
}
