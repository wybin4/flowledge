export interface CourseProgressLesson {
    _id: string;
    progress: number;
    isSurveyPassed?: boolean;
    synopsisProgress?: number;
    videoProgress?: number;
}