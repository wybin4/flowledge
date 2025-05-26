"use client";

import { useEffect, useState } from "react";
import { CoursesListItem } from "../CoursesListItem/CoursesListItem/CoursesListItem";
import { CourseSubscriptions } from "@/collections/CourseSubscriptions";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { CoursesListHeader } from "../CoursesListHeader/CoursesListHeader";
import { useTranslation } from "react-i18next";
import { CoursesListInfinite } from "./CoursesListInfinite";
import { CourseSubscriptionItem } from "../../types/CourseSubscriptionItem";
import { useDataManagement } from "@/hooks/useDataManagement";
import { CourseWithSubscriptionItem } from "../../types/CourseItem";
import styles from "./CoursesListInfinitePage.module.css";
import defaultStyles from "@/courses/styles/Default.module.css";
import cn from "classnames";
import { CoursesListInfiniteFilters } from "./CoursesListInfiniteFilters";
import { NothingFound } from "@/components/NothingFound/NothingFound";

export const CoursesListInfinitePage = () => {
    const [excludedIds, setExcludedIds] = useState<string[] | undefined>(undefined);

    const [visibleFavourites, setVisibleFavourites] = useState<CourseWithSubscriptionItem[] | undefined>(undefined);
    const [countFavourites, setCountFavourites] = useState<number | undefined>(undefined);

    const [visibleSubscriptions, setVisibleSubscriptions] = useState<CourseWithSubscriptionItem[] | undefined>(undefined);
    const [countSubscriptions, setCountSubscriptions] = useState<number | undefined>(undefined);

    const [restCourses, setRestCourses] = useState<CourseWithSubscriptionItem[] | undefined>(undefined);

    const pageSize = usePrivateSetting<number>('preview-page-size') || 5;

    const { setData: setSubs } = useDataManagement<CourseSubscriptionItem>({
        searchQuery: '', // TODO
        setStateCallbacks: CourseSubscriptions.pushCallback.bind(CourseSubscriptions),
        removeStateCallbacks: CourseSubscriptions.popCallback.bind(CourseSubscriptions),
        onSetData: (data) => {
            const favouriteSubs = data.filter(sub => sub.isFavourite === true);
            const restSubs = data.filter(sub => !favouriteSubs.some(fav => fav._id === sub._id));
            const excludedIds = data.map(item => item._id);

            const transSubs = restSubs.map(item => ({
                ...item,
                progress: item.progress?.progress
            }));

            setVisibleSubscriptions(transSubs.slice(0, pageSize));
            setCountSubscriptions(restSubs.length);
            setExcludedIds(excludedIds);

            const transFavourites = favouriteSubs.map(item => ({
                ...item,
                progress: item.progress?.progress
            }));
            setVisibleFavourites(transFavourites.slice(0, pageSize));
            setCountFavourites(favouriteSubs.length);

            setSubs(data);
        }
    });

    useEffect(() => {
        const initialData = CourseSubscriptions.collection.find() ?? [];
        setSubs(initialData);
    }, []);

    const { t } = useTranslation();

    if (!visibleFavourites?.length && !visibleSubscriptions?.length && !restCourses?.length) {
        return (<NothingFound />);
    }

    return (
        <div className={styles.container}>
            <div className={styles.first}>
                {!!visibleFavourites?.length &&
                    <>
                        <CoursesListHeader
                            title={t('favourites')}
                            count={visibleFavourites.length}
                            hasMoreItems={(countFavourites || 0) > pageSize}
                        />
                        {visibleFavourites.map((item, index) => (
                            <CoursesListItem
                                key={index}
                                course={item}
                                isListPage={true}
                            />
                        ))}
                    </>
                }
                {!!visibleSubscriptions?.length &&
                    <>
                        <CoursesListHeader
                            title={t('my-courses')}
                            count={visibleSubscriptions.length}
                            hasMoreItems={(countSubscriptions || 0) > pageSize}
                        />
                        {visibleSubscriptions.map((item, index) => (
                            <CoursesListItem
                                key={index}
                                course={item}
                                isListPage={true}
                            />
                        ))}
                    </>
                }
                {excludedIds &&
                    <CoursesListInfinite
                        courses={restCourses}
                        setCourses={setRestCourses}
                        searchQuery={''}
                        excludedIds={excludedIds}
                    />
                }
            </div>
            <div className={cn(defaultStyles.itemContainer, styles.second)}>
                <CoursesListInfiniteFilters />
            </div>
        </div>
    );
};