"use client";

import { StuffUpload } from "@/stuff/components/StuffUpload";
import { Dispatch, SetStateAction, useState } from "react";
import { FiniteSelector } from "../../../components/FiniteSelector/FiniteSelector";
import { InputBoxWrapper } from "../../../components/InputBox/InputBoxWrapper";
import styles from "./LessonPage.module.css";
import cn from "classnames";
import { Editor } from "../../../components/Editor/Editor";
import { PageMode } from "@/types/PageMode";
import ReactMarkdown from 'react-markdown';
import { StuffItem } from "@/stuff/components/StuffItem";
import { Stuff } from "@/stuff/types/Stuff";
import { StuffTypes } from "@/stuff/types/StuffTypes";
import { SynopsisLessonTabs } from "@/courses/types/SynopsisLessonTabs";
import { LessonStuff } from "../../courses-list/types/LessonStuff";
import { LessonPageItem } from "../../courses-list/types/LessonPageItem";
import { useTranslation } from "react-i18next";
import { coursesListPrefix } from "@/helpers/prefixes";

export type LessonsPageProps = {
    mode: PageMode;
    lesson: LessonPageItem;
    title?: string;
    tabs?: SynopsisLessonTabs[];
    setLesson?: Dispatch<SetStateAction<LessonPageItem>>;
};

export const LessonPage = ({
    mode, title: initialTitle, lesson, setLesson, tabs = Object.values(SynopsisLessonTabs)
}: LessonsPageProps) => {
    const [selectedTab, setSelectedTab] = useState<string>(tabs[0]);

    const { t } = useTranslation();

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

    const title = initialTitle ?? t(`${coursesListPrefix}.lessons.${selectedTab}`);

    return (
        <div className={styles.container}>
            {title &&
                <div className={styles.titleContainer}>
                    <h1 className={styles.title}>{title}</h1>
                </div>
            }
            {lesson.videoUrl && (
                <video className={styles.video} controls poster={lesson.imageUrl}>
                    <source src={lesson.videoUrl} type="video/mp4" />
                    {t('browser-unsupported-video')}
                </video>
            )}
            {tabs.length > 1 && (
                <InputBoxWrapper className={styles.tabsContainer}>
                    {tabs.map(tab =>
                        <FiniteSelector
                            key={tab}
                            value={tab}
                            selectedValue={selectedTab}
                            label={`${coursesListPrefix}.lessons.${tab}`}
                            onClick={() => {
                                setSelectedTab(tab);
                            }}
                            className={styles.tab}
                        />
                    )}
                </InputBoxWrapper>
            )}
            {!isEditorMode && selectedTab === SynopsisLessonTabs.Synopsis && (
                <ReactMarkdown>
                    {lesson.synopsisText}
                </ReactMarkdown>
            )}
            {!isEditorMode &&
                selectedTab === SynopsisLessonTabs.Stuff &&
                lesson.stuffList &&
                lesson.stuffList.length > 0 &&
                lesson.stuffList.map(stuff => (
                    <StuffItem
                        key={stuff._id}
                        stuff={stuff as Stuff}
                        onDownload={() => onDownloadStuff(stuff)}
                    />
                ))
            }
            {isEditorMode &&
                <>
                    <StuffUpload
                        stuffList={lesson.stuffList ?? [] as any}
                        setStuffList={(stuffList) => {
                            setLesson && setLesson((currentLesson: LessonPageItem) => {
                                if (currentLesson) {
                                    return {
                                        ...currentLesson, stuffList: stuffList.map((stuff: Stuff) => ({
                                            ...stuff,
                                            file: {
                                                name: stuff.file?.name,
                                                url: ''
                                            }
                                        })) ?? []
                                    } as LessonPageItem;
                                }
                                return currentLesson;
                            });
                        }}
                        className={cn({
                            [styles.empty]: selectedTab !== SynopsisLessonTabs.Stuff
                        })}
                    />
                    <Editor
                        className={cn({
                            [styles.empty]: selectedTab !== SynopsisLessonTabs.Synopsis
                        })}
                        markdownText={lesson.synopsisText ?? ''}
                        setMarkdownText={(text) => {
                            setLesson && setLesson((currentLesson: LessonPageItem) => {
                                if (currentLesson) {
                                    return {
                                        ...currentLesson, synopsisText: text
                                    } as LessonPageItem;
                                }
                                return currentLesson;
                            });
                            return text;
                        }}
                    />
                </>
            }
        </div>
    );
};