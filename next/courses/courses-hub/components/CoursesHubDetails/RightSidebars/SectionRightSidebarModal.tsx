import { userApiClient } from "@/apiClient";
import RightSidebarModal from "@/components/Sidebar/RightSidebar/RightSidebarModal";
import { SectionToSave } from "@/courses/courses-hub/types/SectionToSave";
import { Section } from "@/courses/types/Section";
import { SectionItem } from "@/courses/types/SectionItem";
import { coursesHubSectionsPrefixTranslate, coursesHubSectionsPrefixApi } from "@/helpers/prefixes";
import { SettingType } from "@/types/Setting";
import { TablePageMode } from "@/types/TablePageMode";
import { Dispatch, SetStateAction, useCallback } from "react";
import { RightSidebarModalProps, ValidateSectionTitle } from "../CoursesHubDetails";

interface SectionRightSidebarModalProps extends RightSidebarModalProps<Section> {
    selectedId: string;
    setSelectedId: Dispatch<SetStateAction<string | undefined>>;
    sections: SectionItem[];
    validateSectionTitle: ValidateSectionTitle;
    sectionTitleError: string;
    setSectionTitleError: Dispatch<SetStateAction<string>>;
};

export const SectionRightSidebarModal = ({
    courseId, selectedId, setSelectedId,
    sections, handleChange,
    validateSectionTitle,
    sectionTitleError, setSectionTitleError,
    setIsExpanded
}: SectionRightSidebarModalProps) => {
    const useGetItemHook = useCallback((callback: (item: Section) => void) => {
        return (_id: string) => {
            const section = sections.find(section => section.section._id === selectedId);
            if (section) {
                callback(section.section);
            }
        };
    }, [selectedId]);

    const clearState = useCallback(() => {
        setSelectedId(undefined);
        setSectionTitleError('');
    }, []);

    return (
        <RightSidebarModal<Section, SectionToSave>
            permissions={{ isEditionPermitted: true, isDeletionPermitted: true }}
            useGetItemHook={useGetItemHook}
            prefix={coursesHubSectionsPrefixTranslate}
            apiPrefix={coursesHubSectionsPrefixApi}
            mode={TablePageMode.EDIT}
            _id={selectedId}
            settingKeys={[
                { name: 'title', types: [SettingType.InputText], error: sectionTitleError },
                {
                    name: 'isVisible',
                    types: [SettingType.Radio],
                    hasDescription: true,
                    additionalProps: { withWrapper: false }
                }
            ]}
            apiClient={userApiClient}
            transformItemToSave={(item) => {
                const { title, isVisible } = item;
                if (!validateSectionTitle(title)) {
                    throw new Error('Invalid section title');
                }
                const body = { title, courseId, isVisible };
                return body;
            }}
            createEmptyItem={() => ({
                _id: "",
                title: "",
                courseId: courseId,
                isVisible: false
            })}
            onBackButtonClick={() => {
                clearState();
                setIsExpanded(false);
            }}
            isBackWithRouter={false}
            onActionCallback={(type, item) => {
                handleChange(type, item, selectedId);
                clearState();
                setIsExpanded(false);
            }}
        />
    );
};