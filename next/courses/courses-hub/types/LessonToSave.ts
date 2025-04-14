export type LessonToSaveOnVideoUploadRequest = {
    videoId?: string;
    synopsis?: string;
    survey?: string;
    isVisible: boolean;
    sectionId: string;
}

export type LessonToSaveOnVideoUploadResponse = {
    lessonId: string;
}