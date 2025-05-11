import { ICourse } from "@/types/Course";
import { ICourseSubscription } from "@/types/CourseSubscription";

export interface CourseSubscriptionItem extends ICourseSubscription, Omit<ICourse, '_id'> { }