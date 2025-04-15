export type LessonToSaveOnDraftRequest = {
    videoId?: string;
    synopsis?: string;
    survey?: string;
    isVisible: boolean;
    sectionId: string;
}

export type LessonToSaveOnDraftResponse = {
    lessonId: string;
}

export type LessonToSaveOnDetailsRequest = {
    _id: string;
    title: string;
    time: string;
}