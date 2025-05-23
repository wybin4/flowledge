import { LessonSaveType } from "@/courses/types/LessonSaveType";
import { EnhancedCrumb } from "@/types/EnhancedCrumb";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const createLessonCrumbs = (
    step: LessonSaveType, onClick: (type: LessonSaveType, router: AppRouterInstance) => void
): EnhancedCrumb[] => {
    const steps = Object.values(LessonSaveType);

    return steps.map((stepKey) => ({
        name: stepKey.toLowerCase(),
        checked: false,
        current: stepKey === step,
        onClick: stepKey != LessonSaveType.Draft ? (router) => onClick(stepKey, router) : undefined
    }));
};