export enum LessonSaveType {
    Draft = 'DRAFT',
    Details = 'DETAILS',
}

interface LessonToSaveRequest {
    type: LessonSaveType;
}

export interface LessonToSaveOnDraftRequest extends LessonToSaveRequest {
    videoId?: string;
    synopsis?: string;
    survey?: string;
    isVisible: boolean;
    sectionId: string;
}

export type LessonToSaveOnDraftResponse = {
    lessonId: string;
}

export type LessonToSaveOnDetailsRequestTime = {
    time?: number;
    timeUnit?: string;
    autoDetect?: boolean;
}

export interface LessonToSaveOnDetailsRequest extends
    LessonToSaveRequest,
    Omit<LessonToSaveOnDetails, 'time'>,
    LessonToSaveOnDetailsRequestTime { }

export type LessonToSaveOnDetails = {
    _id: string;
    title: string;
    time: LessonToSaveOnDetailsRequestTime;
}