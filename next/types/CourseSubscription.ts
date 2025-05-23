import { CourseProgress } from "@/courses/courses-hub/types/progress/CourseProgress";

export interface ICourseSubscription {
    _id: string;
    userId: string;
    courseId: string;
    isFavourite?: boolean;
    isSubscribed?: boolean;

    roles?: string[];

    progress?: CourseProgress;
    courseVersion?: string;
}
