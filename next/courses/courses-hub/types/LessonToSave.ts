import { LessonSaveType } from "@/courses/types/LessonSaveType";

export enum LessonAdditionalSaveType {
    RemoveVideo = 'REMOVE-VIDEO',
}

interface LessonToSaveRequest {
    type: LessonSaveType | LessonAdditionalSaveType;
}

export interface LessonToSaveOnDraftRequest extends LessonToSaveRequest {
    id: string;
    videoId?: string;
    synopsis?: string;
    survey?: string;
}

export type LessonToSaveOnDraftResponse = {
    lessonId: string;
}

export type LessonToSaveOnDetailsRequestTime = {
    time?: number;
    timeUnit?: string;
    autoDetect?: boolean;
    imageUrl?: string;
}

export interface LessonToSaveOnDetailsRequest extends
    LessonToSaveRequest,
    Omit<LessonToSaveOnDetails, 'time'>,
    LessonToSaveOnDetailsRequestTime { }

export type LessonToSaveOnDetails = {
    id: string;
    title: string;
    time: LessonToSaveOnDetailsRequestTime;
    imageUrl?: string;
}
