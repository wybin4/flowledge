"use client";

import { CoursesItemHeader } from "@/courses/components/CoursesItemHeader/CoursesItemHeader";
import { CoursesListItemDescription } from "@/courses/components/CoursesListItemDescription/CoursesListItemDescription";
import { CoursesHubEditors } from "./CoursesHubEditors/CoursesHubEditors/CoursesHubEditors";
import { CoursesHubDetail } from "../../types/CoursesHubDetails";
import { CourseSection } from "@/courses/components/CourseSection/CourseSection";
import { coursesHubPrefix, coursesHubSectionsPrefixApi, coursesHubSectionsPrefixTranslate } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import styles from "./CoursesHubDetails.module.css";
import { CoursesHubDetailsHeader } from "./CoursesHubDetailsHeader/CoursesHubDetailsHeader";
import { handlePluralTranslation } from "@/helpers/handlePluralTranslation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Language } from "@/user/types/Language";
import { CollapsibleSectionActionProps } from "@/components/CollapsibleSection/CollapsibleSectionAction";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useRouter } from "next/navigation";
import { memo, useState, useCallback } from "react";
import { userApiClient } from "@/apiClient";
import { Section } from "@/courses/types/Section";
import { useSaveItem } from "@/hooks/useSaveItem";
import { SectionToSave } from "../../types/SectionToSave";
import { SectionItem } from "@/courses/types/SectionItem";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import cn from "classnames";
import { useNonPersistentSidebar } from "@/hooks/useNonPersistentSidebar";
import { RightSidebarModal } from "@/components/Sidebar/RightSidebar/RightSidebarModal";
import { TablePageMode } from "@/types/TablePageMode";
import { SettingType } from "@/types/Setting";
import { TablePageActionType } from "@/types/TablePageActionType";
import { getItemsFromStringRange } from "@/helpers/getItemsFromStringRange";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { getErrorByRegex } from "@/helpers/getErrorByRegex";
import { Modal } from "@/components/Modal/Modal";
import { CoursesHubEditorsModal } from "./CoursesHubEditors/CoursesHubEditorsModal/CoursesHubEditorsModal";

export const CoursesHubDetails = memo(({ course }: { course: CoursesHubDetail }) => {
    const [courseSections, setCourseSections] = useState<SectionItem[]>(course.sections || []);
    const [newSection, setNewSection] = useState<string | undefined>(undefined);
    const [selectedSectionIdToEdit, setSelectedSectionIdToEdit] = useState<string | undefined>(undefined);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

    const [sectionTitleError, setSectionTitleError] = useState<string>('');

    const { t } = useTranslation();

    const locale = useUserSetting<Language>('language') || Language.EN;
    const titleLength = usePrivateSetting<string>(`${coursesHubPrefix}.title-length`) || '(3,100)';
    const titleRegex = usePrivateSetting<string>(`${coursesHubPrefix}.title-regex`) || '[a-zA-Z0-9_ .!]+';

    const { min: minTitleLength, max: maxTitleLength } = getItemsFromStringRange(titleLength);
    const getTitleRegexError = getErrorByRegex(titleRegex, coursesHubPrefix, t);

    const countSections = courseSections.length || 0;
    const countLessons = courseSections.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0;
    const countSectionsText = handlePluralTranslation(coursesHubPrefix, t, countSections, 'sections', locale);
    const countLessonsText = handlePluralTranslation(coursesHubPrefix, t, countLessons, 'lessons', locale);

    const router = useRouter();

    const handleAddSection = () => {
        setNewSection('');
        setSectionTitleError('');
    };

    const handleCancelNewSection = () => {
        setNewSection(undefined);
        setSectionTitleError('');
    };

    const validateSectionTitle = (title: string) => {
        if (title.length < minTitleLength || title.length > maxTitleLength) {
            setSectionTitleError(t(`${coursesHubPrefix}.title-length.error`, { min: minTitleLength, max: maxTitleLength }));
            return false;
        }
        if (getTitleRegexError(title)) {
            setSectionTitleError(getTitleRegexError(title));
            return false;
        }
        return true;
    };

    const handleSaveNewSection = async (_id?: string) => {
        if (newSection) {
            const result = await useSaveItem<Section, SectionToSave>({
                isCreate: _id ? false : true,
                prefix: coursesHubSectionsPrefixApi,
                apiClient: userApiClient,
                _id,
                item: {
                    title: newSection,
                    courseId: course._id,
                    isVisible: false
                } as unknown as Section
            });
            if (result) {
                if (_id) {
                    setCourseSections(courseSections.map(section => {
                        if (section.section._id === result._id) {
                            section.section.title = result.title;
                        }
                        return section;
                    }));
                } else {
                    setCourseSections([...courseSections, {
                        section: result, lessons: []
                    }]);
                }
                setNewSection(undefined);
            }
        }
    };

    const useGetItemHook = useCallback((callback: (item: Section) => void) => {
        return (_id: string) => {
            const section = courseSections.find(section => section.section._id === selectedSectionIdToEdit);
            if (section) {
                callback(section.section);
            }
        };
    }, [selectedSectionIdToEdit]);

    const clearState = useCallback(() => {
        setSelectedSectionIdToEdit(undefined);
        setSectionTitleError('');
    }, []);

    return (
        <RightSidebar
            useSidebarHook={useNonPersistentSidebar}
            content={(classNames, setIsExpanded) => <div className={cn(classNames)}>
                <RightSidebarModal<Section, SectionToSave>
                    useGetItemHook={useGetItemHook}
                    prefix={coursesHubSectionsPrefixTranslate}
                    apiPrefix={coursesHubSectionsPrefixApi}
                    queryParams={{ isSmall: true }}
                    mode={TablePageMode.EDIT}
                    _id={selectedSectionIdToEdit}
                    settingKeys={[
                        { name: 'title', types: [SettingType.InputText], error: sectionTitleError },
                        { name: 'isVisible', types: [SettingType.Radio], hasDescription: true }
                    ]}
                    apiClient={userApiClient}
                    transformItemToSave={(item) => {
                        const { title, courseId, isVisible } = item;
                        if (!validateSectionTitle(title)) {
                            throw new Error('Invalid section title');
                        }
                        const body = { title, courseId, isVisible };
                        return body;
                    }}
                    createEmptyItem={() => ({
                        _id: "",
                        title: "",
                        courseId: course._id,
                        isVisible: false
                    })}
                    onBackButtonClick={() => {
                        clearState();
                        setIsExpanded(false);
                    }}
                    isBackWithRouter={false}
                    onActionCallback={(type, item) => {
                        clearState();
                        setIsExpanded(false);
                        if (type === TablePageActionType.DELETE) {
                            setCourseSections(courseSections.filter(section => section.section._id !== selectedSectionIdToEdit));
                        } else if (type === TablePageActionType.EDIT) {
                            setCourseSections(courseSections.map(section => {
                                if (section.section._id === selectedSectionIdToEdit && item) {
                                    section.section = item;
                                }
                                return section;
                            }));
                        }
                    }}
                />
            </div>}
        >
            {(isExpanded, onClick) => (
                <div className={cn({ [styles.expanded]: isExpanded })}>
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        {onClose => <CoursesHubEditorsModal editors={course.editors || []} onCancel={onClose as any} />}
                    </Modal>
                    <CoursesItemHeader
                        course={course}
                        header={<Breadcrumbs position={ChildrenPosition.Left} currentPathName={t(`${coursesHubPrefix}.current-course`)} />}
                        pointer={false}
                    />
                    <CoursesListItemDescription
                        description={course.description}
                        isExpanded={true}
                    />
                    <CoursesHubDetailsHeader
                        title={t(`${coursesHubPrefix}.editors`)}
                        action={`${t(`${coursesHubPrefix}.manage-editors`)}`}
                        onClick={() => setIsModalOpen(true)}
                    />
                    {course.editors && course.editors.length > 0 && <CoursesHubEditors editors={course.editors} />}
                    <div className={styles.sectionsContainer}>
                        <CoursesHubDetailsHeader
                            title={t(`${coursesHubSectionsPrefixTranslate}.name`)}
                            description={`${countSectionsText} · ${countLessonsText}`}
                            action={newSection !== undefined ? `- ${t(`${coursesHubSectionsPrefixTranslate}.cancel`)}` : `+ ${t(`${coursesHubSectionsPrefixTranslate}.add`)}`}
                            onClick={newSection !== undefined ? handleCancelNewSection : handleAddSection}
                        />
                        {newSection !== undefined &&
                            <CourseSection
                                validateSectionTitle={validateSectionTitle}
                                sectionTitleError={sectionTitleError}
                                section={newSection}
                                className={styles.newSection}
                                setNewSection={setNewSection}
                                onSaveNewSection={() => handleSaveNewSection()}
                            />
                        }
                        {courseSections && courseSections.length > 0 && courseSections.map(section => (
                            <CourseSection
                                key={section.section._id}
                                section={section}
                                actions={[{
                                    title: t('edit'),
                                    type: ChildrenPosition.Right,
                                    onClick: () => {
                                        setSelectedSectionIdToEdit(section.section._id);
                                        onClick();
                                    }
                                },
                                {
                                    title: `+ ${t(`${coursesHubPrefix}.add-lesson`)}`,
                                    onClick: () => {
                                        router.push(`/courses-hub/${course._id}?sectionId=${section.section._id}`);
                                    },
                                    type: ChildrenPosition.Bottom
                                }]}
                                className={styles.section}
                            />
                        ))}
                    </div>
                </div>
            )}
        </RightSidebar>
    );
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.course) === JSON.stringify(nextProps.course);
});