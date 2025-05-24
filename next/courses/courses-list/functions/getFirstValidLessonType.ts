import { LessonGetResponse } from "@/courses/courses-hub/dto/LessonGetResponse";
import { checkLessonProperty } from "@/courses/functions/checkLessonProperty";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

export const getFirstValidLessonType = (lesson: LessonGetResponse): LessonSaveType | null => {
    const excludedTypes = [LessonSaveType.Draft.toLowerCase(), LessonSaveType.Details.toLowerCase()];

    for (const type of Object.values(LessonSaveType)) {
        if (!excludedTypes.includes(type.toLowerCase()) && checkLessonProperty(lesson, type.toLowerCase())) {
            return type;
        }
    }
    return null;
};