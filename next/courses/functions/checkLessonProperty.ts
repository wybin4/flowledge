import { getTranslationsArray } from "@/helpers/getTranslationsArray";
import { LessonGetResponse } from "../courses-hub/dto/LessonGetResponse";
import { LessonSaveType } from "../types/LessonSaveType";

export const checkLessonProperty = (lesson: LessonGetResponse, property: string): boolean => {
    switch (property) {
        case LessonSaveType.Draft.toLowerCase():
            return true;
        case LessonSaveType.Video.toLowerCase():
            return !!lesson.videoId;
        case LessonSaveType.Details.toLowerCase():
            return !getTranslationsArray('draft').some(keyword => lesson.title.includes(keyword)) || !!lesson.time;
        case LessonSaveType.Synopsis.toLowerCase():
            return !!lesson.synopsisText;
        case LessonSaveType.Survey.toLowerCase():
            return !!lesson.surveyText || !!lesson.survey;
        default:
            return false;
    }
};