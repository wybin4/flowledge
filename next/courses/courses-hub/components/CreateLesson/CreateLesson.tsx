"use client";

import { EnhancedBreadcrumbs } from "@/components/EnhancedBreadcrumbs/EnhancedBreadcrumbs";
import { coursesHubPrefix } from "@/helpers/prefixes";
import { TablePageMode } from "@/types/TablePageMode";
import { createLessonCrumbs } from "../../functions/createLessonCrumbs";
import { LessonSaveType } from "../../types/LessonToSave";
import { CreateLessonDetails } from "./CreateLessonDetails/CreateLessonDetails";
import { CreateLessonSurvey } from "./CreateLessonSurvey/CreateLessonSurvey";
import { CreateLessonSynopsisAndStuff } from "./CreateLessonSynopsisAndStuff/CreateLessonSynopsisAndStuff";
import { CreateLessonVideo } from "./CreateLessonVideo/CreateLessonVideo";

export type CreateLessonProps = Partial<Record<Lowercase<keyof typeof LessonSaveType>, string>> & {
    _id: string;
    hasVideo?: string;
    questionId?: string;
};

export const CreateLesson = ({ _id, hasVideo, ...props }: CreateLessonProps) => {
    const componentMap = {
        [LessonSaveType.Video]: () => <CreateLessonVideo _id={_id} mode={TablePageMode.CREATE} />,
        [LessonSaveType.Details]: () => <CreateLessonDetails _id={_id} hasVideo={JSON.parse(hasVideo || 'false') === true} />,
        [LessonSaveType.Synopsis]: () => <CreateLessonSynopsisAndStuff _id={_id} />,
        [LessonSaveType.Survey]: () => <CreateLessonSurvey selectedQuestionId={_id} />,
        [LessonSaveType.Draft]: () => null,
    };

    for (const [key, value] of Object.entries(props || {})) {
        const type = key.toUpperCase() as LessonSaveType;
        if (Object.values(LessonSaveType).includes(type) && JSON.parse(value || 'false') === true) {
            return (
                <EnhancedBreadcrumbs
                    prefix={coursesHubPrefix}
                    crumbs={createLessonCrumbs(type, (currType, router) => {
                        router.push(`?${currType.toLowerCase()}=true`)
                    })}
                >
                    {componentMap[type]()}
                </EnhancedBreadcrumbs>
            );
        }
    }

    return null;
};