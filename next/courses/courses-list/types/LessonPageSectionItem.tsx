export type LessonPageSectionItem = {
    title: string;
    courseId: string;
    courseName: string;
    lessons: {
        _id: string;
        title: string;
        imageUrl?: string;
        videoId?: string;
        surveyId?: string;
        hasSynopsis: boolean;
    }[];
};
