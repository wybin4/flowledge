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

export const CoursesListInfinitePage = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [subscriptions, setSubscriptions] = useState<CourseSubscriptionItem[] | undefined>(undefined);
    const [excludedIds, setExcludedIds] = useState<string[] | undefined>(undefined);

    const [visibleFavourites, setVisibleFavourites] = useState<CourseSubscriptionItem[] | undefined>(undefined);
    const [countFavourites, setCountFavourites] = useState<number | undefined>(undefined);

    const pageSize = usePrivateSetting<number>('preview-page-size') || 5;

    const { data: subs, setData: setSubs } = useDataManagement<CourseSubscriptionItem>({
        searchQuery,
        setStateCallbacks: CourseSubscriptions.pushCallback.bind(CourseSubscriptions),
        removeStateCallbacks: CourseSubscriptions.popCallback.bind(CourseSubscriptions),
        onSetData: (data) => {
            const favouriteSubs = data.filter(sub => sub.isFavourite === true);
            const restSubs = data.filter(sub => !favouriteSubs.some(fav => fav._id === sub._id));
            const excludedIds = data.map(item => item.courseId);

            setSubscriptions(restSubs);
            setExcludedIds(excludedIds);

            setVisibleFavourites(favouriteSubs.slice(0, pageSize));
            setCountFavourites(favouriteSubs.length);

            setSubs(data);
        }
    });

    useEffect(() => {
        const initialData = CourseSubscriptions.collection.find() ?? [];
        setSubs(initialData);
    }, []);

    const { t } = useTranslation();

    return (
        <>
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
            {subs && subscriptions && excludedIds &&
                <CoursesListInfinite
                    searchQuery={searchQuery}
                    subscriptions={subscriptions}
                    excludedIds={excludedIds}
                />
            }
        </>
    );
};