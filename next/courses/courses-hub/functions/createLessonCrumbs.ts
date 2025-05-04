import { EnhancedCrumb } from "@/types/EnhancedCrumb";
import { LessonSaveType } from "../types/LessonToSave";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const createLessonCrumbs = (
    step: LessonSaveType, onClick: (type: LessonSaveType, router: AppRouterInstance) => void
): EnhancedCrumb[] => {
    const steps = Object.values(LessonSaveType);
    const currentStepIndex = steps.indexOf(step);

    return steps.map((stepKey, index) => ({
        name: stepKey.toLowerCase(),
        checked: index < currentStepIndex,
        current: stepKey === step,
        onClick: stepKey != LessonSaveType.Draft ? (router) => onClick(stepKey, router) : undefined
    }));
};