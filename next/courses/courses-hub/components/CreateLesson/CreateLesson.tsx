"use client";

import { EnhancedBreadcrumbs } from "@/components/EnhancedBreadcrumbs/EnhancedBreadcrumbs";
import { coursesHubLessonsPrefixApi, coursesHubPrefix } from "@/helpers/prefixes";
import { createLessonCrumbs } from "../../functions/createLessonCrumbs";
import { CreateLessonDetails } from "./CreateLessonDetails/CreateLessonDetails";
import { CreateLessonSurvey } from "./CreateLessonSurvey/CreateLessonSurvey";
import { CreateLessonSynopsisAndStuff } from "./CreateLessonSynopsisAndStuff/CreateLessonSynopsisAndStuff";
import { CreateLessonVideo } from "./CreateLessonVideo/CreateLessonVideo";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { userApiClient } from "@/apiClient";
import { LessonGetByIdResponse } from "../../dto/LessonGetByIdResponse";
import { enrichCrumbWithLesson } from "../../functions/enrichCrumbWithLesson";
import { LessonSaveType } from "@/courses/types/LessonSaveType";
import { usePathname } from "next/navigation";

export type CreateLessonProps = Partial<Record<Lowercase<keyof typeof LessonSaveType>, string>> & {
    id: string;
    hasVideo?: string;
    questionId?: string;
};

export interface CreateLessonChildrenProps {
    lessonId: string;
    setLesson: Dispatch<SetStateAction<LessonGetByIdResponse | undefined>>;
    courseId: string;
}

export const CreateLesson = ({ id, hasVideo, questionId, ...props }: CreateLessonProps) => {
    const [lesson, setLesson] = useState<LessonGetByIdResponse | undefined>(undefined);

    const currentPath = usePathname();

    const pathSegments = currentPath.split('/');
    const courseId = pathSegments[2];

    useEffect(() => {
        userApiClient.get<LessonGetByIdResponse>(
            `${coursesHubLessonsPrefixApi}.get/${id}?courseId=${courseId}`
        ).then(lesson => setLesson(lesson));
    }, [id]);

    const componentMap = {
        [LessonSaveType.Video]: () => (
            <CreateLessonVideo
                lessonId={id}
                courseId={courseId}
                setLesson={setLesson}
                videoId={lesson?.videoId}
            />
        ),
        [LessonSaveType.Details]: () => (
            <CreateLessonDetails
                lessonId={id}
                courseId={courseId}
                time={lesson?.time}
                title={lesson?.title}
                imageUrl={lesson?.imageUrl}
                setLesson={setLesson}
                hasVideo={JSON.parse(hasVideo || 'false') === true}
            />
        ),
        [LessonSaveType.Synopsis]: () => (
            <CreateLessonSynopsisAndStuff
                lessonId={id}
                courseId={courseId}
                setLesson={setLesson}
                synopsisText={lesson?.synopsisText}
                stuffList={[]} // TODO
            />
        ),
        [LessonSaveType.Survey]: () => (
            <CreateLessonSurvey
                lessonId={id}
                courseId={courseId}
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