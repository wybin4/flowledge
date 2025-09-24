import { CachedCollectionWithPagination } from "./CachedCollectionWithPagination";
import { CourseSubscriptionItem } from "@/courses/courses-list/types/CourseSubscriptionItem";

export const CourseSubscriptions = new CachedCollectionWithPagination<CourseSubscriptionItem>(
    'course-subscriptions'
);

export const findSubscriptionByCourseId = (id: string): CourseSubscriptionItem | null => {
    return CourseSubscriptions.collection.findOne({ id });
};