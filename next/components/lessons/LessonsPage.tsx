"use client";

import { StuffUpload } from "@/stuff/components/StuffUpload";
import { useState } from "react";
import { FiniteSelector } from "../finiteSelector/FiniteSelector";
import { InputBoxWrapper } from "../inputBox/InputBoxWrapper";
import RightSidebar from "../sidebar/RightSidebar";
import styles from "./LessonsPage.module.css";
import { LessonTabs } from "@/types/LessonTabs";
import cn from "classnames";

export const LessonsPage = () => {
    const tabs = Object.values(LessonTabs);
    const [selectedTab, setSelectedTab] = useState<LessonTabs>(tabs[0]);

    return (
        <div className={styles.container}>
            <RightSidebar>
                <div>click on me</div>
            </RightSidebar>
            <InputBoxWrapper className={styles.tabsContainer}>
                {tabs.map(tab =>
                    <FiniteSelector
                        key={tab}
                        value={tab}
                        selectedValue={selectedTab}
                        label={`lesson.${tab}`}
                        onClick={() => setSelectedTab(tab)}
                    />
                )}
            </InputBoxWrapper>
            <StuffUpload className={cn({
                [styles.empty]: selectedTab !== LessonTabs.Stuff
            })} />
        </div>
    );
};