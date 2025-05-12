import { getTranslationsArray } from "@/helpers/getTranslationsArray";
import { EnhancedCrumb } from "@/types/EnhancedCrumb";
import { LessonGetResponse } from "../dto/LessonGetResponse";
import { LessonSaveType } from "../types/LessonToSave";

export const enrichCrumbWithLesson = (crumb: EnhancedCrumb, lesson?: LessonGetResponse): EnhancedCrumb => {
    let checked = false;
    if (lesson) {
        switch (crumb.name) {
            case LessonSaveType.Draft.toLowerCase():
                checked = true;
                break;
            case LessonSaveType.Video.toLowerCase():
                checked = !!lesson.videoId;
                break;
            case LessonSaveType.Details.toLowerCase():
                checked = !getTranslationsArray('draft').some(keyword => lesson.title.includes(keyword)) || !!lesson.time;
                break;
            case LessonSaveType.Synopsis.toLowerCase():
                checked = !!lesson.synopsisText; // TODO: stuff
                break;
            case LessonSaveType.Survey.toLowerCase():
                checked = !!lesson.surveyText || !!lesson.survey;
                break;
        }
    }
    return { ...crumb, checked };
};