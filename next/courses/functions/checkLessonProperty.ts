import { getTranslationsArray } from "@/helpers/getTranslationsArray";
import { LessonGetResponse } from "../courses-hub/dto/LessonGetResponse";
import { LessonSaveType } from "../types/LessonSaveType";

export const checkLessonProperty = (lesson: LessonGetResponse, property: LessonSaveType): boolean => {
    switch (property) {
        case LessonSaveType.Draft:
            return true;
        case LessonSaveType.Video:
            return !!lesson.videoId;
        case LessonSaveType.Details:
            return !getTranslationsArray('draft').some(keyword => lesson.title.includes(keyword)) || !!lesson.time;
        case LessonSaveType.Synopsis:
            return !!lesson.synopsisText;
        case LessonSaveType.Survey:
            return !!lesson.surveyText || !!lesson.survey;
        default:
            return false;
    }
};