"use client";

import { StuffUpload } from "@/stuff/components/StuffUpload";
import { useState } from "react";
import { FiniteSelector } from "../finiteSelector/FiniteSelector";
import { InputBoxWrapper } from "../inputBox/InputBoxWrapper";
import RightSidebar from "../sidebar/RightSidebar";
import styles from "./LessonsPage.module.css";
import { LessonTabs } from "@/types/LessonTabs";
import cn from "classnames";
import { MenuButton } from "../menuButton/MenuButton";
import { Editor } from "../editor/Editor";

export const LessonsPage = () => {
    const tabs = Object.values(LessonTabs);
    const [selectedTab, setSelectedTab] = useState<LessonTabs>(tabs[0]);
    const [markdownText, setMarkdownText] = useState<string>('');

    return (
        <div className={styles.container}>
            <RightSidebar>
                {(isExpanded, onClick) => (
                    <div className={cn({
                        [styles.expanded]: isExpanded
                    })}>
                        <MenuButton isExpanded={isExpanded} onClick={onClick} />
                        <InputBoxWrapper className={styles.tabsContainer}>
                            {tabs.map(tab =>
                                <FiniteSelector
                                    key={tab}
                                    value={tab}
                                    selectedValue={selectedTab}
                                    label={`lesson.${tab}`}
                                    onClick={() => setSelectedTab(tab)}
                                    className={styles.tab}
                                />
                            )}
                        </InputBoxWrapper>
                        <StuffUpload className={cn({
                            [styles.empty]: selectedTab !== LessonTabs.Stuff
                        })} />
                        <Editor
                            className={cn({
                                [styles.empty]: selectedTab !== LessonTabs.Synopsis
                            })}
                            markdownText={markdownText}
                            setMarkdownText={setMarkdownText}
                        />
                    </div>
                )}
            </RightSidebar>
        </div>
    );
};