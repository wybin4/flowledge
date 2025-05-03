import { EnhancedCrumb } from "@/types/EnhancedCrumb";
import { LessonSaveType } from "../types/LessonToSave";

export const createCreateLessonCrumbs = (step: LessonSaveType): EnhancedCrumb[] => {
    return Object.keys(LessonSaveType).map(key => ({
        name: key.toLowerCase(),
        checked: LessonSaveType[key as keyof typeof LessonSaveType] === step
    }));
};
