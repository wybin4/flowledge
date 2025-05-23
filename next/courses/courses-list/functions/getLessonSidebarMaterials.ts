import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { LessonPageSectionLessonItemMapped } from "../types/LessonPageSectionItem";
import { SynopsisLessonTabs } from "../../types/SynopsisLessonTabs";
import { LessonsPageFlags } from "../../components/LessonPage/LessonPage";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

export type LessonSidebarMaterials = {
    type: LessonSaveType;
    description: string;
    condition: boolean;
    tab?: SynopsisLessonTabs | string;
    selected?: boolean;
    flags?: LessonsPageFlags;
    classNames?: string;
    onClick?: (router: AppRouterInstance) => void;
};

export const getLessonSidebarMaterials = (
    lesson: LessonPageSectionLessonItemMapped,
    styles: {
        readonly [key: string]: string;
    }
): LessonSidebarMaterials[] => {
    return [
        {
            description: 'watch-video',
            condition: !!lesson.videoUrl, tab: 'video',
            selected: true, classNames: styles.videoContainer,
            type: LessonSaveType.Video
        },
        {
            description: 'read-synopsis',
            flags: { hideVideo: true },
            condition: lesson.hasSynopsis, tab: SynopsisLessonTabs.Synopsis,
            type: LessonSaveType.Synopsis
        },
        {
            description: 'test-yourself',
            condition: !!lesson.surveyId,
            onClick: (router: AppRouterInstance) => router.push('?survey=true'),
            type: LessonSaveType.Survey
        }
    ].filter(material => material.condition);
};
