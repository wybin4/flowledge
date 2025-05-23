import { CachedCollectionWithPagination } from "./CachedCollectionWithPagination";
import { CourseSubscriptionItem } from "@/courses/courses-list/types/CourseSubscriptionItem";

export const CourseSubscriptions = new CachedCollectionWithPagination<CourseSubscriptionItem>(
    'course-subscriptions'
);

export const findSubscriptionByCourseId = (courseId: string): CourseSubscriptionItem | null => {
    return CourseSubscriptions.collection.findOne({ courseId });
};