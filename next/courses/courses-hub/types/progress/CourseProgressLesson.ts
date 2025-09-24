export interface CourseProgressLesson {
    id: string;
    progress: number;
    isSurveyPassed?: boolean;
    synopsisProgress?: number;
    videoProgress?: number;
}