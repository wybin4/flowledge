import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { coursesListPrefix } from "@/helpers/prefixes";
import { CourseTabs } from "@/types/CourseTabs";
import styles from "./CoursesListItemMenu.module.css";
import cn from "classnames";

type CoursesListItemMenuProps = {
    className?: string;
    selectedTab: CourseTabs;
    setSelectedTab: (tab: CourseTabs) => void;
}

export const CoursesListItemMenu = ({ className, selectedTab, setSelectedTab }: CoursesListItemMenuProps) => {
    const tabs = Object.values(CourseTabs);

    return (
        <div className={cn(styles.menu, className)}>
            {tabs.map(tab => (
                <FiniteSelector
                    key={tab}
                    value={tab}
                    selectedValue={selectedTab}
                    label={`${coursesListPrefix}.${tab}.name`}
                    onClick={() => setSelectedTab(tab)}
                    className={styles.tab}
                />
            ))}
        </div>
    );
};
