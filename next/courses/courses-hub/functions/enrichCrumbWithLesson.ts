import { EnhancedCrumb } from "@/types/EnhancedCrumb";
import { LessonGetResponse } from "../dto/LessonGetResponse";
import { LessonSaveType } from "@/courses/types/LessonSaveType";
import { checkLessonProperty } from "@/courses/functions/checkLessonProperty";

export const enrichCrumbWithLesson = (crumb: EnhancedCrumb, lesson?: LessonGetResponse): EnhancedCrumb => {
    const checked = lesson ? checkLessonProperty(lesson, crumb.name as LessonSaveType) : false;
    return { ...crumb, checked };
};