import { CourseSubscriptions, findSubscriptionByCourseId } from "@/collections/CourseSubscriptions";
import { useStateFromService } from "@/hooks/useStateFromService";
import { useEffect, useState } from "react";
import { CourseSubscriptionItem } from "../courses-list/types/CourseSubscriptionItem";

export const useCourseSubscription = (_id: string): CourseSubscriptionItem | null => {
    const getValue = () => findSubscriptionByCourseId(_id);
    const [subscription, setSubscription] = useState<CourseSubscriptionItem | null>(getValue());

    useEffect(() => {
        setSubscription(getValue());
    }, [_id]);

    useStateFromService(
        getValue,
        CourseSubscriptions.eventName,
        CourseSubscriptions,
        (newState) => {
            if (Array.isArray(newState)) {
                setSubscription(newState[0] as CourseSubscriptionItem);
            }
        }
    );

    return subscription;
};
