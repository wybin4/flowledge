import { userApiClient } from "@/apiClient";
import RightSidebarModal from "@/components/Sidebar/RightSidebar/RightSidebarModal";
import { coursesHubLessonsPrefixTranslate, coursesHubLessonsPrefixApi, coursesHubPrefix } from "@/helpers/prefixes";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { Dispatch, SetStateAction, useCallback } from "react";
import { LessonToSaveVisibility } from "@/courses/courses-hub/types/LessonToSaveVisibility";
import { CourseLessonItem } from "@/courses/courses-list/types/CourseLessonItem";
import { TimeUnit } from "@/types/TimeUnit";
import { Card } from "@/components/Card/Card";
import { ItemSize } from "@/types/ItemSize";
import { LessonSaveType } from "@/courses/courses-hub/types/LessonToSave";
import { createLessonCrumbs } from "@/courses/courses-hub/functions/createLessonCrumbs";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useIcon } from "@/hooks/useIcon";
import { RightSidebarModalProps } from "../CoursesHubDetails";

interface LessonRightSidebarModalProps extends RightSidebarModalProps<CourseLessonItem> {
    selected: CourseLessonItem;
    setSelected: Dispatch<SetStateAction<CourseLessonItem | undefined>>;
};

export const LessonRightSidebarModal = ({
    courseId,
    selected, setSelected, handleChange,
    setIsExpanded
}: LessonRightSidebarModalProps) => {
    const useGetItemHook = useCallback((callback: (item: CourseLessonItem) => void) => {
        return (_id: string) => {
            callback(selected);
            return selected;
        };
    }, []);

    const crumbs = createLessonCrumbs(LessonSaveType.Draft, (currType, router) => {
        router.replace(`${courseId}/${selected._id}?${currType.toLowerCase()}=true`)
    });
    const router = useRouter();

    const { t } = useTranslation();

    const checkIcon = useIcon('check');

    const clearState = useCallback(() => {
        setSelected(undefined);
    }, []);

    return (
        <RightSidebarModal<CourseLessonItem, LessonToSaveVisibility>
            permissions={{ isEditionPermitted: true, isDeletionPermitted: true }}
            useGetItemHook={useGetItemHook}
            prefix={coursesHubLessonsPrefixTranslate}
            apiPrefix={coursesHubLessonsPrefixApi}
            title={`${t('edit')} "${selected.title}"`}
            mode={TablePageMode.EDIT}
            _id={selected._id}
            settingKeys={[{
                name: 'isVisible',
                types: [SettingType.Radio],
                hasDescription: true,
                additionalProps: { withWrapper: false }
            }]}
            hasDeleteDescription={false}
            apiClient={userApiClient}
            transformItemToSave={(item) => {
                return { _id: item._id, isVisible: item.isVisible ?? false };
            }}
            createEmptyItem={() => ({
                _id: "",
                isVisible: false,
                title: "",
                time: TimeUnit.MINS
            })}
            onBackButtonClick={() => {
                setIsExpanded(false);
                clearState();
            }}
            isBackWithRouter={false}
            onActionCallback={(type, item) => {
                handleChange(type, item, selected._id);
                setIsExpanded(false);
                clearState();
            }}
            additionalChildren={
                <div style={{ width: '93%', marginTop: '2rem' }}>
                    {
                        crumbs.map((crumb, index) => (
                            <Card
                                key={index}
                                title={_ => t(`${coursesHubPrefix}.${crumb.name}`)}
                                onClick={() => crumb.onClick?.(router)}
                                dotText={_ => crumb.onClick ? '—' : checkIcon}
                                size={ItemSize.Little}
                                clickable={!!crumb.onClick}
                            />
                        ))
                    }
                </div>
            }
        />
    );
};