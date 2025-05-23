import { userApiClient } from "@/apiClient";
import RightSidebarModal from "@/components/Sidebar/RightSidebar/RightSidebarModal";
import { coursesHubLessonsPrefixTranslate, coursesHubLessonsPrefixApi, coursesHubPrefix } from "@/helpers/prefixes";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { Dispatch, SetStateAction, useCallback } from "react";
import { LessonToSaveVisibility } from "@/courses/courses-hub/types/LessonToSaveVisibility";
import { LessonGetResponse } from "@/courses/courses-hub/dto/LessonGetResponse";
import { Card } from "@/components/Card/Card";
import { ItemSize } from "@/types/ItemSize";
import { createLessonCrumbs } from "@/courses/courses-hub/functions/createLessonCrumbs";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useIcon } from "@/hooks/useIcon";
import { RightSidebarModalProps } from "../CoursesHubDetails";
import { enrichCrumbWithLesson } from "@/courses/courses-hub/functions/enrichCrumbWithLesson";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

interface LessonRightSidebarModalProps extends RightSidebarModalProps<LessonGetResponse> {
    selected: LessonGetResponse;
    setSelected: Dispatch<SetStateAction<LessonGetResponse | undefined>>;
};

export const LessonRightSidebarModal = ({
    courseId,
    selected, setSelected, handleChange,
    setIsExpanded
}: LessonRightSidebarModalProps) => {
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
        <RightSidebarModal<LessonGetResponse, LessonToSaveVisibility>
            permissions={{ isEditionPermitted: true, isDeletionPermitted: true }}
            passedInitialValues={selected}
            prefix={coursesHubLessonsPrefixTranslate}
            apiPrefix={coursesHubLessonsPrefixApi}
            queryParams={{ courseId }}
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
                return { _id: item._id, isVisible: item.isVisible ?? false, courseId };
            }}
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
            additionalChildren={item => (
                <div style={{ width: '93%', marginTop: '2rem' }}>
                    {
                        crumbs
                            .map(crumb => enrichCrumbWithLesson(crumb, item))
                            .map((crumb, index) => (
                                <Card
                                    key={index}
                                    title={_ => t(`${coursesHubPrefix}.${crumb.name}`)}
                                    onClick={() => crumb.onClick?.(router)}
                                    dotText={_ => !crumb.checked ? '—' : checkIcon}
                                    size={ItemSize.Little}
                                    clickable={!!crumb.onClick}
                                />
                            ))
                    }
                </div>
            )}
        />
    );
};