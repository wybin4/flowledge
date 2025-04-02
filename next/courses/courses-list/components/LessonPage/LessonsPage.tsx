"use client";

import { StuffUpload } from "@/stuff/components/StuffUpload";
import { useState } from "react";
import { FiniteSelector } from "../../../../components/FiniteSelector/FiniteSelector";
import { InputBoxWrapper } from "../../../../components/InputBox/InputBoxWrapper";
import RightSidebar from "../../../../components/Sidebar/RightSidebar";
import styles from "./LessonsPage.module.css";
import { LessonTabs } from "@/types/LessonTabs";
import cn from "classnames";
import { MenuButton } from "../../../../components/MenuButton/MenuButton";
import { Editor } from "../../../../components/Editor/Editor";
import { PageMode } from "@/types/PageMode";
import ReactMarkdown from 'react-markdown';
import { LessonItem, LessonStuff } from "../../types/LessonItem";
import { StuffItem } from "@/stuff/components/StuffItem";
import { Stuff } from "@/stuff/types/Stuff";
import { StuffTypes } from "@/stuff/types/StuffTypes";
import CollapsibleSection from "@/components/CollapsibleSection/CollapsibleSection";
import classNames from "classnames";

export type LessonsPageProps = {
    mode: PageMode;
    lesson: LessonItem;
};

export const LessonsPage = ({ mode, lesson }: LessonsPageProps) => {
    const tabs = Object.values(LessonTabs);
    const [selectedTab, setSelectedTab] = useState<LessonTabs>(tabs[0]);
    const [markdownText, setMarkdownText] = useState<string>('');
    const isEditorMode = mode === PageMode.Editor;

    const onDownloadStuff = (stuff: LessonStuff) => {
        if (stuff.type === StuffTypes.Link) {
            window.open(stuff.value, '_blank');
            return;
        }

        if (stuff.file && stuff.file.url) {
            const link = document.createElement('a');
            link.href = stuff.file.url;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className={styles.container}>
            <RightSidebar content={classNames =>
                <>
                    <div style={{ height: '5.5625rem' }}></div>
                    <div style={{ overflowY: 'scroll', height: 'max-content' }}>
                        <CollapsibleSection title='основные понятия' expandedByDefault={true} {...classNames}>
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='проектирование по' expandedByDefault={false} {...classNames}>
                            дети
                        </CollapsibleSection>
                        <CollapsibleSection title='классические методы' expandedByDefault={false} {...classNames}>
                            дети
                        </CollapsibleSection>
                    </div>
                </>
            }>
                {(isExpanded, onClick) => (
                    <div className={cn({
                        [styles.expanded]: isExpanded
                    })}>
                        <div className={styles.titleContainer}>
                            <h1 className={styles.title}>{lesson.title}</h1>
                            <MenuButton isExpanded={isExpanded} onClick={onClick} />
                        </div>
                        {lesson.videoUrl && (
                            <video className={styles.video} controls poster={lesson.imageUrl}>
                                <source src={lesson.videoUrl} type="video/mp4" />
                                Ваш браузер не поддерживает видео.
                            </video>
                        )}
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
                        {!isEditorMode && selectedTab === LessonTabs.Synopsis && <ReactMarkdown>{lesson.synopsis}</ReactMarkdown>}
                        {!isEditorMode && selectedTab === LessonTabs.Stuff && lesson.stuffs && lesson.stuffs.length > 0 && lesson.stuffs.map(stuff => (
                            <StuffItem key={stuff._id} stuff={stuff as Stuff} onDownload={() => onDownloadStuff(stuff)} />
                        ))}
                        {isEditorMode &&
                            <>
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
                            </>
                        }
                    </div>
                )}
            </RightSidebar>
        </div>
    );
};