import styles from "./CoursesHubSideSection.module.css";
import { Button, ButtonType } from "@/components/Button/Button";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { LabeledAvatar, LabeledAvatarItem } from "@/components/LabeledAvatar/LabeledAvatar";
import { useTranslation } from "react-i18next";
import { courseSubscriptionsPrefix } from "@/helpers/prefixes";
import { handlePluralTranslation } from "@/helpers/handlePluralTranslation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Language } from "@/user/types/Language";
import { userApiClient } from "@/apiClient";
import { setQueryParams } from "@/helpers/setQueryParams";
import { useState, useEffect } from "react";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { SubscriptionWithUserResponse } from "@/courses/courses-hub/dto/SubscriptionWithUserResponse";
import { CoursesHubSideSectionAdditionalTabs, CoursesHubSideSectionChildrenProps } from "./CoursesHubSideSection";
import { useIcon } from "@/hooks/useIcon";
import { ItemSize } from "@/types/ItemSize";
import { usePermissions } from "@/hooks/usePermissions";

const userSectionPermissions = ['manage-subscribers', 'view-all-users'];

export const CoursesHubSideSectionUsers = ({ prefix, courseId, setTab }: CoursesHubSideSectionChildrenProps) => {
    const { t } = useTranslation();
    const locale = useUserSetting<Language>('language') || Language.EN;

    const [subscribers, setSubscribers] = useState<LabeledAvatarItem[]>([]);
    const [subscribersCount, setSubscribersCount] = useState<number>(0);
    const pageSize = usePrivateSetting<number>('preview-page-size') ?? 5;

    const optionsIcon = useIcon('options');

    const [manageSubscribers, viewAllUsers] = usePermissions(userSectionPermissions);

    useEffect(() => {
        userApiClient.get<SubscriptionWithUserResponse[]>(
            `${courseSubscriptionsPrefix}.get/${courseId}${setQueryParams({ pageSize })}`
        ).then(users => {
            setSubscribers(users.map(u => ({
                value: u.id,
                label: u.name,
                avatar: u.avatar
            })));
        });

        userApiClient.get<number>(
            `${courseSubscriptionsPrefix}.count/${courseId}${setQueryParams({ pageSize })}`
        ).then(count => {
            setSubscribersCount(count);
        });
    }, []);

    return (
        <>
            <div className={styles.body}>
                <div className={styles.count}>{handlePluralTranslation(prefix, t, subscribersCount, 'users', locale)}</div>
                <div className={styles.subscribers}>
                    <div className={styles.subscribersContainer}>
                        {subscribers.map((subscriber, index) => (
                            <LabeledAvatar
                                key={index}
                                item={subscriber}
                                size={ItemSize.Big}
                                child={_ => manageSubscribers && (
                                    <div className={styles.subscriberOptionsIcon}>{optionsIcon}</div>
                                )}
                            />
                        ))}
                    </div>
                    {subscribersCount > subscribers.length && (
                        <Button
                            onClick={() => { }}
                            title={t('view-all')}
                            type={ButtonType.SAVE}
                            mode={FillBorderUnderlineMode.UNDERLINE}
                            noEffects={true}
                            className={styles.viewAllButton}
                        />
                    )}
                </div>
            </div>
            {manageSubscribers && viewAllUsers && (
                <div className={styles.footer}>
                    <Button
                        onClick={() => setTab(CoursesHubSideSectionAdditionalTabs.AddUsers)}
                        title={`+ ${t(`${prefix}.add-users`)}`}
                        type={ButtonType.SAVE}
                        className={styles.addNewButton}
                    />
                </div>
            )}
        </>
    );
};