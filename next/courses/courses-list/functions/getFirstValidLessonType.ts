import { LessonGetResponse } from "@/courses/courses-hub/dto/LessonGetResponse";
import { checkLessonProperty } from "@/courses/functions/checkLessonProperty";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

export const getFirstValidLessonType = (lesson: LessonGetResponse): LessonSaveType | null => {
    const excludedTypes = [LessonSaveType.Draft, LessonSaveType.Details];

    for (const type of Object.values(LessonSaveType)) {
        if (!excludedTypes.includes(type) && checkLessonProperty(lesson, type)) {
            return type;
        }
    }
    return null;
};