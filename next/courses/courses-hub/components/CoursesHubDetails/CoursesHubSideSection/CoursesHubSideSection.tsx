import { useIcon } from "@/hooks/useIcon";
import styles from "./CoursesHubSideSection.module.css";
import { FiniteSelector } from "@/components/FiniteSelector/FiniteSelector";
import { useState } from "react";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import defaultStyles from "@/courses/styles/Default.module.css";
import cn from "classnames";
import { CoursesHubSideSectionUsers } from "./CoursesHubSideSectionUsers";
import { CoursesHubSideSectionStatistics } from "./CoursesHubSideSectionStatistics";
import { useTranslation } from "react-i18next";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { CoursesHubSideSectionAddUsers } from "./CoursesHubSideSectionAddUsers";

export enum CoursesHubSideSectionMainTabs { Users = 'users', Statistics = 'statistics' };
export enum CoursesHubSideSectionAdditionalTabs { AddUsers = 'add-users' };
export type CoursesHubSideSectionTabs = CoursesHubSideSectionMainTabs | CoursesHubSideSectionAdditionalTabs;
export interface CoursesHubSideSectionChildrenProps {
    prefix: string;
    courseId: string;
    setTab: (tab: CoursesHubSideSectionAdditionalTabs) => void;
};

export const CoursesHubSideSection = ({ courseId, tabs }: { courseId: string, tabs: CoursesHubSideSectionMainTabs[] }) => {
    const usersIcon = useIcon('users');
    const statisticsIcon = useIcon('statistics');
    const additionalTabs = Object.values(CoursesHubSideSectionAdditionalTabs);

    const prefix = `${coursesHubPrefix}.sidebar`;

    const { t } = useTranslation();

    const [selectedTab, setSelectedTab] = useState<CoursesHubSideSectionTabs>(tabs[0]);

    return (
        <div className={cn(styles.container, defaultStyles.itemContainer)}>
            {tabs.includes(selectedTab as CoursesHubSideSectionMainTabs) && (
                <div className={styles.selector}>
                    {tabs.map(tab => (
                        <FiniteSelector
                            key={tab}
                            value={tab}
                            selectedValue={selectedTab}
                            label={`${prefix}.${tab}`}
                            icon={tab === CoursesHubSideSectionMainTabs.Users ? usersIcon : statisticsIcon}
                            iconPosition={ChildrenPosition.Left}
                            onClick={() => setSelectedTab(tab)}
                            className={styles.tab}
                            activeClassName={styles.activeTab}
                        />
                    ))}
                </div>
            )}
            {additionalTabs.includes(selectedTab as CoursesHubSideSectionAdditionalTabs) && (
                <>
                    <div className={styles.additionalTabHeader}>
                        <ButtonBack
                            hasBackButtonText={false}
                            isBackWithRouter={false}
                            onBackButtonClick={() => setSelectedTab(CoursesHubSideSectionMainTabs.Users)}
                            backButtonStyles={styles.backButton}
                        />
                        <div>{t(`${prefix}.add-users`)}</div>
                    </div>
                    <CoursesHubSideSectionAddUsers
                        prefix={prefix}
                        courseId={courseId}
                        setTab={setSelectedTab}
                    />
                </>
            )}

            {selectedTab === CoursesHubSideSectionMainTabs.Users && (
                <CoursesHubSideSectionUsers
                    prefix={prefix}
                    courseId={courseId}
                    setTab={setSelectedTab}
                />
            )}
            {selectedTab === CoursesHubSideSectionMainTabs.Statistics && <CoursesHubSideSectionStatistics />}
        </div>
    );
};