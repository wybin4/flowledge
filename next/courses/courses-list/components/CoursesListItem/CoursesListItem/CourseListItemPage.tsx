"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { CoursesListItem } from "./CoursesListItem";
import { useGetItem } from "@/hooks/useGetItem";
import { coursesListPrefixApi } from "@/helpers/prefixes";
import { userApiClient } from "@/apiClient";
import { CourseItem, CourseWithSubscriptionItem } from "@/courses/courses-list/types/CourseItem";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCourseSubscription } from "@/courses/hooks/useCourseSubscription";
import { CourseSubscriptionItem } from "@/courses/courses-list/types/CourseSubscriptionItem";

export const CourseListItemPage = ({ _id }: { _id: string }) => {
    const [course, setCourse] = useState<CourseWithSubscriptionItem | undefined>(undefined);
    const { t } = useTranslation();

    const subscription = useCourseSubscription(_id);

    const setCourseWithProgress = (course: CourseItem, subscription: CourseSubscriptionItem): CourseWithSubscriptionItem => {
        const progress = subscription.progress;

        if (!progress) {
            return {
                ...course,
                isFavourite: subscription.isFavourite,
                isSubscribed: subscription.isSubscribed,
                courseVersion: subscription.courseVersion
            };
        }

        const updatedSections = course.sections?.map(section => {
            const sectionProgress = progress.sections.find(s => s._id === section.section._id);

            const updatedSection = {
                ...section.section,
                progress: sectionProgress?.progress
            };

            const updatedLessons = section.lessons?.map(lesson => {
                const lessonProgress = sectionProgress?.lessons.find(l => l._id === lesson._id);
                return {
                    ...lesson,
                    progress: lessonProgress?.progress,
                    isSurveyPassed: lessonProgress?.isSurveyPassed,
                    synopsisProgress: lessonProgress?.synopsisProgress,
                    videoProgress: lessonProgress?.videoProgress
                };
            });

            return {
                ...section,
                section: updatedSection,
                lessons: updatedLessons
            };
        });

        return {
            ...course,
            progress: subscription.progress?.progress,
            sections: updatedSections,
            isFavourite: subscription.isFavourite,
            isSubscribed: subscription.isSubscribed,
            courseVersion: subscription.courseVersion
        };
    };

    useEffect(() => {
        const fetchCourse = async () => {
            const courseRes = await useGetItem<CourseItem>(coursesListPrefixApi, userApiClient, _id);
            if (courseRes) {
                if (subscription) {
                    setCourse(setCourseWithProgress(courseRes, subscription));
                } else {
                    setCourse(courseRes);
                }
            }
        };

        fetchCourse();
    }, [_id]);

    useEffect(() => {
        if (course && subscription) {
            setCourse(setCourseWithProgress(course, subscription));
        }
    }, [JSON.stringify(subscription)]);

    if (!course) {
        return <div>{t('loading')}</div>;
    }

    return (
        <CoursesListItem
            course={course}
            header={
                <Breadcrumbs
                    currentPathName={course.title}
                    position={ChildrenPosition.Left}
                />
            }
            pointer={false}
            isListPage={false}
        />
    );
};