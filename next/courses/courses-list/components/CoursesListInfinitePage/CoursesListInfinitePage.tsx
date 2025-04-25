"use client";

import { useEffect, useState } from "react";
import { CoursesListItem } from "../CoursesListItem/CoursesListItem/CoursesListItem";
import { CourseSubscriptions } from "@/collections/CourseSubscriptions";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { CoursesListHeader } from "../CoursesListHeader/CoursesListHeader";
import { useTranslation } from "react-i18next";
import { CoursesListInfinite } from "./CoursesListInfinite";
import { CourseSubscriptionItem } from "../../types/CourseSubscriptionItem";
import { usePagination } from "@/hooks/usePagination";
import { courseSubscriptionsPrefix } from "@/helpers/prefixes";
import { GetDataPage } from "@/types/GetDataPage";
import { useGetItems } from "@/hooks/useGetItems";
import { DataPageHookFunctions } from "@/types/DataPageHook";

export const CoursesListInfinitePage = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [subscriptions, setSubscriptions] = useState<CourseSubscriptionItem[] | undefined>(undefined);
    const [excludedIds, setExcludedIds] = useState<string[] | undefined>(undefined);
    const [favourites, setFavourites] = useState<CourseSubscriptionItem[] | undefined>(undefined);

    const pageSize = usePrivateSetting<number>('preview-page-size') || 5;

    const getDataPageFunctions: DataPageHookFunctions<CourseSubscriptionItem> = {
        getDataPage: (_, props) => CourseSubscriptions.getPage(props),
    };

    const getDataPageHook =
        (paginationProps: GetDataPage) => useGetItems<CourseSubscriptionItem>(
            courseSubscriptionsPrefix,
            getDataPageFunctions,
            paginationProps
        );

    const { data: subs } = usePagination<CourseSubscriptionItem>({
        itemsPerPage: pageSize,
        getDataPageHook,
        searchQuery,
        setStateCallbacks: CourseSubscriptions.pushCallback.bind(CourseSubscriptions),
        removeStateCallbacks: CourseSubscriptions.popCallback.bind(CourseSubscriptions),
        onSetData: (data) => {
            const favouriteSubs = data.filter(sub => sub.isFavourite == true);
            const restSubs = data.filter(sub => !favouriteSubs.some(fav => fav._id === sub._id));
            console.log('pl343433', favouriteSubs, restSubs)
            setFavourites(favouriteSubs);
            setSubscriptions(restSubs);
            setExcludedIds(data.map(item => item.courseId));
            console.log(restSubs)
        }
    });

    // useEffect(() => {
    //     console.log('pl1')
    // const favouriteSubs = subs.filter(sub => sub.isFavourite == true);
    // const restSubs = subs.filter(sub => sub.isFavourite == false);
    // setFavourites(favouriteSubs);
    // setSubscriptions(restSubs);
    // }, [subs]);
    const { t } = useTranslation();

    return (
        <>
            {!!favourites?.length &&
                <>
                    <CoursesListHeader title={t('favourites')} count={favourites.length} />
                    {favourites.map((item, index) => (
                        <CoursesListItem
                            key={index}
                            course={item}
                            isListPage={true}
                        />
                    ))}
                </>
            }
            {subs &&
                <CoursesListInfinite
                    searchQuery={searchQuery}
                    subscriptions={subscriptions}
                    excludedIds={excludedIds ?? []}
                />
            }
        </>
    );
};