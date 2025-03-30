import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { coursesListPrefix } from "@/helpers/prefixes";
import { CourseTabs } from "@/types/CourseTabs";
import { useState } from "react";
import styles from "./CoursesListItemMenu.module.css";

type CoursesListItemMenuProps = {
    className?: string;
    selectedTab: CourseTabs;
    setSelectedTab: (tab: CourseTabs) => void;
}

export const CoursesListItemMenu = ({ className, selectedTab, setSelectedTab }: CoursesListItemMenuProps) => {
    const tabs = Object.values(CourseTabs);

    return (
        <div className={className}>
            {tabs.map(tab => (
                <FiniteSelector
                    key={tab}
                    value={tab}
                    selectedValue={selectedTab}
                    label={`${coursesListPrefix}.menu.${tab}`}
                    onClick={() => setSelectedTab(tab)}
                    className={styles.tab}
                />
            ))}
        </div>
    );
};
