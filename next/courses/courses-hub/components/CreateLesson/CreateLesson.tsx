"use client";

import { EnhancedBreadcrumbs } from "@/components/EnhancedBreadcrumbs/EnhancedBreadcrumbs";
import { coursesHubLessonsPrefixApi, coursesHubPrefix } from "@/helpers/prefixes";
import { createLessonCrumbs } from "../../functions/createLessonCrumbs";
import { LessonSaveType } from "../../types/LessonToSave";
import { CreateLessonDetails } from "./CreateLessonDetails/CreateLessonDetails";
import { CreateLessonSurvey } from "./CreateLessonSurvey/CreateLessonSurvey";
import { CreateLessonSynopsisAndStuff } from "./CreateLessonSynopsisAndStuff/CreateLessonSynopsisAndStuff";
import { CreateLessonVideo } from "./CreateLessonVideo/CreateLessonVideo";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { userApiClient } from "@/apiClient";
import { LessonGetByIdResponse } from "../../dto/LessonGetByIdResponse";
import { enrichCrumbWithLesson } from "../../functions/enrichCrumbWithLesson";

export type CreateLessonProps = Partial<Record<Lowercase<keyof typeof LessonSaveType>, string>> & {
    _id: string;
    hasVideo?: string;
    questionId?: string;
};

export interface CreateLessonChildrenProps {
    lessonId: string;
    setLesson: Dispatch<SetStateAction<LessonGetByIdResponse | undefined>>;
}

export const CreateLesson = ({ _id, hasVideo, questionId, ...props }: CreateLessonProps) => {
    const [lesson, setLesson] = useState<LessonGetByIdResponse | undefined>(undefined);

    useEffect(() => {
        userApiClient.get<LessonGetByIdResponse>(
            `${coursesHubLessonsPrefixApi}.get/${_id}`
        ).then(lesson => setLesson(lesson));
    }, [_id]);

    const componentMap = {
        [LessonSaveType.Video]: () => (
            <CreateLessonVideo
                lessonId={_id}
                setLesson={setLesson}
                videoId={lesson?.videoId}
            />
        ),
        [LessonSaveType.Details]: () => (
            <CreateLessonDetails
                lessonId={_id}
                time={lesson?.time}
                title={lesson?.title}
                imageUrl={lesson?.imageUrl}
                setLesson={setLesson}
                hasVideo={JSON.parse(hasVideo || 'false') === true}
            />
        ),
        [LessonSaveType.Synopsis]: () => (
            <CreateLessonSynopsisAndStuff
                lessonId={_id}
                setLesson={setLesson}
                synopsisText={lesson?.synopsisText}
                stuffList={[]} // TODO
            />
        ),
        [LessonSaveType.Survey]: () => (
            <CreateLessonSurvey
                lessonId={_id}
                setLesson={setLesson}
                selectedQuestionId={questionId}
                questions={lesson?.surveyText}
                survey={lesson?.survey}
            />
        ),
        [LessonSaveType.Draft]: () => null,
    };

    for (const [key, value] of Object.entries(props || {})) {
        const type = key.toUpperCase() as LessonSaveType;
        if (Object.values(LessonSaveType).includes(type) && JSON.parse(value || 'false') === true) {
            return (
                <EnhancedBreadcrumbs
                    prefix={coursesHubPrefix}
                    crumbs={
                        createLessonCrumbs(type, (currType, router) => {
                            router.push(`?${currType.toLowerCase()}=true`)
                        }).map(crumb => enrichCrumbWithLesson(crumb, lesson))
                    }
                >
                    {componentMap[type]()}
                </EnhancedBreadcrumbs>
            );
        }
    }

    return null;
};