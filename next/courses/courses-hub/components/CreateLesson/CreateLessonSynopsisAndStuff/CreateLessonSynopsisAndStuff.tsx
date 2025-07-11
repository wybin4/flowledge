"use client";

import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { LessonPage } from "@/courses/components/LessonPage/LessonPage";
import { PageMode } from "@/types/PageMode";
import { useEffect, useState } from "react";
import styles from "./CreateLessonSynopsisAndStuff.module.css";
import { coursesHubLessonsPrefixApi, coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { Button, ButtonType } from "@/components/Button/Button";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { CreateLessonChildrenProps } from "../CreateLesson";
import { LessonStuff } from "@/courses/courses-list/types/LessonStuff";
import { userApiClient } from "@/apiClient";
import { LessonPageItem } from "@/courses/courses-list/types/LessonPageItem";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

interface CreateLessonSynopsisAndStuffProps extends CreateLessonChildrenProps {
    synopsisText?: string;
    stuffList?: LessonStuff[];
}

export const CreateLessonSynopsisAndStuff = ({ lessonId, synopsisText, stuffList, courseId }: CreateLessonSynopsisAndStuffProps) => {
    const saveItem = () => userApiClient.post(
        `${coursesHubLessonsPrefixApi}.create`, {
        ...lesson, type: LessonSaveType.Synopsis, courseId
    });

    const initialLesson: LessonPageItem = {
        _id: lessonId, title: '', time: '', synopsisText, stuffList
    };

    useEffect(() => {
        setLesson(initialLesson);
    }, [lessonId, synopsisText, JSON.stringify(stuffList)]);

    const [lesson, setLesson] = useState<LessonPageItem>(initialLesson);

    return (
        <StickyBottomBar barContent={
            <div className={styles.buttonContainer}>
                <ButtonBack hasBackButtonIcon={false} />
                {JSON.stringify(initialLesson) != JSON.stringify(lesson) &&
                    <Button
                        onClick={saveItem}
                        prefix={coursesHubLessonsPrefixTranslate}
                        type={ButtonType.SAVE}
                        mode={FillBorderUnderlineMode.UNDERLINE}
                        noEffects={true}
                    />
                }
            </div>
        }>
            <LessonPage
                mode={PageMode.Editor}
                lesson={lesson}
                title={lesson.title}
                setLesson={setLesson}
            />
        </StickyBottomBar>
    );
};