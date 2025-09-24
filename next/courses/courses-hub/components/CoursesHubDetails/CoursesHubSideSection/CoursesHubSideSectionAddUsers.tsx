import styles from "./CoursesHubSideSection.module.css";
import { CoursesHubSideSectionChildrenProps, CoursesHubSideSectionMainTabs, CoursesHubSideSectionTabs } from "./CoursesHubSideSection";
import { userApiClient } from "@/apiClient";
import { LabeledAvatar, LabeledAvatarItem } from "@/components/LabeledAvatar/LabeledAvatar";
import { UserGetResponse } from "@/dto/UserGetResponse";
import { setQueryParams } from "@/helpers/setQueryParams";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { useState, useEffect } from "react";
import { InfiniteSelectorMultiple } from "@/components/InfiniteSelector/InifiniteSelectorMultiple";
import { Button, ButtonType } from "@/components/Button/Button";
import { useTranslation } from "react-i18next";
import { courseSubscriptionsPrefix } from "@/helpers/prefixes";

export const CoursesHubSideSectionAddUsers = ({ courseId, prefix, setTab }: CoursesHubSideSectionChildrenProps) => {
    const [users, setUsers] = useState<LabeledAvatarItem[]>([]);
    const [subscribers, setSubscribers] = useState<LabeledAvatarItem[]>([]);

    const { t } = useTranslation();

    const pageSize = usePrivateSetting<number>('preview-page-size') ?? 5;
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        userApiClient.get<UserGetResponse[]>(
            `users.get${setQueryParams({
                pageSize, searchQuery, isSmall: true
            })}`
        ).then(users => {
            setUsers(users.map(u => ({
                value: u.id,
                label: u.name,
                avatar: u.avatar
            })))
        });
    }, [searchQuery]);

    const handleAdd = () => {
        const userIds = subscribers.map(s => s.value);
        if (!userIds.length) {
            return;
        }

        userApiClient.post(
            `${courseSubscriptionsPrefix}.create`,
            { courseId, userIds }
        ).then(_ => {
            return setTab(CoursesHubSideSectionMainTabs.Users as any);
        })
    };

    return (
        <div className={styles.body}>
            <div className={styles.flexOne}>
                <InfiniteSelectorMultiple
                    prefix={prefix}
                    selectedValues={subscribers}
                    setSelectedValues={setSubscribers}
                    optionWidth='93%'
                    selectedKey='users_for_subscribers'
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    options={users}
                    formatOptionLabel={(option: any) => (
                        <LabeledAvatar
                            key={option.value}
                            item={option} />
                    )}
                    noOptionsPlaceholder={`${prefix}.no-users-for-subscribers`}
                />
            </div>
            <Button
                onClick={handleAdd}
                title={t(`${prefix}.add-users`)}
                type={ButtonType.SAVE}
                className={styles.addNewButton}
                disabled={!subscribers.length}
            />
        </div>
    );
};