import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { LessonPageSectionLessonItemMapped } from "../types/LessonPageSectionItem";
import { SynopsisLessonTabs } from "../../types/SynopsisLessonTabs";
import { LessonsPageFlags } from "../../components/LessonPage/LessonPage";

export type LessonSidebarMaterials = {
    type: string;
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
            type: 'video', description: 'watch-video',
            condition: !!lesson.videoUrl, tab: 'video',
            selected: true, classNames: styles.videoContainer
        },
        {
            type: 'synopsis', description: 'read-synopsis',
            flags: { hideVideo: true },
            condition: lesson.hasSynopsis, tab: SynopsisLessonTabs.Synopsis
        },
        {
            type: 'survey', description: 'test-yourself',
            condition: !!lesson.surveyId,
            onClick: (router: AppRouterInstance) => router.push('?survey=true')
        }
    ].filter(material => material.condition);
};
