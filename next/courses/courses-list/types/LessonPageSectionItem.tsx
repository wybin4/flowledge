export interface LessonPageSectionItem {
    title: string;
    courseId: string;
    courseName: string;
    nextSectionLessonId?: string;
    lessons: LessonPageSectionLessonItem[];
};

export interface LessonPageSectionLessonItem {
    id: string;
    title: string;
    imageUrl?: string;

    videoId?: string;
    surveyId?: string;
    hasSynopsis: boolean;
};

export interface LessonPageSectionLessonItemMapped extends Omit<LessonPageSectionLessonItem, 'videoId'> {
    videoUrl?: string;
}