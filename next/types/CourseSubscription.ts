export interface ICourseSubscription {
    _id: string;
    userId: string;
    courseId: string;
    isFavourite?: boolean;
    isSubscribed?: boolean;
    roles?: string[];
}
