import { CourseProgress } from "@/courses/courses-hub/types/progress/CourseProgress";

export interface ICourseSubscription {
    _id: string;
    subId: string;
    userId: string;
    isFavourite?: boolean;
    isSubscribed?: boolean;

    roles?: string[];

    progress?: CourseProgress;
    courseVersion?: string;
}
