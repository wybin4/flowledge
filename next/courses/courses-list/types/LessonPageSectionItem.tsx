export interface LessonPageSectionItem {
    title: string;
    courseId: string;
    courseName: string;
    lessons: LessonPageSectionLessonItem[];
};

export interface LessonPageSectionLessonItem {
    _id: string;
    title: string;
    imageUrl?: string;
    videoId?: string;
    surveyId?: string;
    hasSynopsis: boolean;
};

export interface LessonPageSectionLessonItemMapped extends Omit<LessonPageSectionLessonItem, 'videoId'> {
    videoUrl?: string;
}