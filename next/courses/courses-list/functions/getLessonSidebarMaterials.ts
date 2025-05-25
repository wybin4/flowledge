import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { LessonPageSectionLessonItemMapped } from "../types/LessonPageSectionItem";
import { SynopsisLessonTabs } from "../../types/SynopsisLessonTabs";
import { LessonsPageFlags } from "../../components/LessonPage/LessonPage";
import { LessonSaveType } from "@/courses/types/LessonSaveType";
import { Gender } from "@/types/Gender";

export type LessonSidebarMaterials = {
    type: LessonSaveType;
    description: string;
    condition: boolean;
    tab?: SynopsisLessonTabs | string;
    selected?: boolean;
    flags?: LessonsPageFlags;
    classNames?: string;
    onClick?: (router: AppRouterInstance) => void;
    progress?: number;
    gender: Gender;
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
            type: LessonSaveType.Video,
            gender: Gender.Neural
        },
        {
            description: 'read-synopsis',
            flags: { hideVideo: true },
            condition: lesson.hasSynopsis, tab: SynopsisLessonTabs.Synopsis,
            type: LessonSaveType.Synopsis,
            gender: Gender.Male
        },
        {
            description: 'test-yourself',
            condition: !!lesson.surveyId,
            onClick: (router: AppRouterInstance) => router.push('?survey=true'),
            type: LessonSaveType.Survey,
            gender: Gender.Male
        }
    ].filter(material => material.condition);
};
