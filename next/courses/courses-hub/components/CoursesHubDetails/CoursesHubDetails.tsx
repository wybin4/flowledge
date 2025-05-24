"use client";

import { CoursesItemHeader } from "@/courses/components/CoursesItemHeader/CoursesItemHeader";
import { CoursesListItemDescription } from "@/courses/components/CoursesListItemDescription/CoursesListItemDescription";
import { CoursesHubEditors } from "./CoursesHubEditors/CoursesHubEditors/CoursesHubEditors";
import { CoursesHubDetail } from "../../types/CoursesHubDetails";
import { CourseSection } from "@/courses/components/CourseSection/CourseSection";
import { coursesHubEditorsPrefixTranslate, coursesHubLessonsPrefixApi, coursesHubPrefix, coursesHubSectionsPrefixApi, coursesHubSectionsPrefixTranslate } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import styles from "./CoursesHubDetails.module.css";
import { CoursesHubDetailsHeader } from "./CoursesHubDetailsHeader/CoursesHubDetailsHeader";
import { handlePluralTranslation } from "@/helpers/handlePluralTranslation";
import { useUserSetting } from "@/user/hooks/useUserSetting";
import { Language } from "@/user/types/Language";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { userApiClient } from "@/apiClient";
import { Section } from "@/courses/types/Section";
import { useSaveItem } from "@/hooks/useSaveItem";
import { SectionToSave } from "../../types/SectionToSave";
import { SectionItem } from "@/courses/types/SectionItem";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import cn from "classnames";
import { useNonPersistentSidebar } from "@/hooks/useNonPersistentSidebar";
import { getItemsFromStringRange } from "@/helpers/getItemsFromStringRange";
import { usePrivateSetting } from "@/private-settings/hooks/usePrivateSetting";
import { getErrorByRegex } from "@/helpers/getErrorByRegex";
import { Modal } from "@/components/Modal/Modal";
import { CoursesHubEditorsModal } from "./CoursesHubEditors/CoursesHubEditorsModal/CoursesHubEditorsModal";
import { CourseEditor } from "../../types/CourseEditor";
import { LessonToSaveOnDraftResponse } from "../../types/LessonToSave";
import { CoursesHubSideSection, CoursesHubSideSectionMainTabs } from "./CoursesHubSideSection/CoursesHubSideSection";
import { usePermissions } from "@/hooks/usePermissions";
import { SectionRightSidebarModal } from "./RightSidebars/SectionRightSidebarModal";
import { LessonRightSidebarModal } from "./RightSidebars/LessonRightSidebarModal";
import { LessonGetResponse } from "@/courses/courses-hub/dto/LessonGetResponse";
import { TablePageActionType } from "@/types/TablePageActionType";
import { Tag, TagType } from "@/components/Tag/Tag";
import { getPublicationStatus } from "../../functions/getPublicationStatus";
import { LessonSaveType } from "@/courses/types/LessonSaveType";

const detailsPermissions = [
    'view-subscribers',
    'view-course-statistics',
    'manage-owners',
    'manage-moderators'
];

export type ValidateSectionTitle = (title: string) => boolean;

export interface RightSidebarModalProps<T> {
    courseId: string;
    setIsExpanded: (isExpanded: boolean) => void;
    handleChange: HandleChangeInRightSidebar<T>;
};
type HandleChangeInRightSidebar<T,> = (type: TablePageActionType, item?: T, id?: string) => void;

export const CoursesHubDetails = memo(({ course }: { course: CoursesHubDetail }) => {
    const [courseSections, setCourseSections] = useState<SectionItem[]>(course.sections || []);
    const [courseEditors, setCourseEditors] = useState<CourseEditor[]>(course.editors || []);
    const [newSection, setNewSection] = useState<string | undefined>(undefined);
    const [selectedSectionIdToEdit, setSelectedSectionIdToEdit] = useState<string | undefined>(undefined);
    const [selectedLessonToEdit, setSelectedLessonToEdit] = useState<LessonGetResponse | undefined>(undefined);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

    const validateSectionTitle: ValidateSectionTitle = (title: string) => {
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

    const [
        viewSubscribers,
        viewStatistics,
        manageOwners, manageModerators
    ] = usePermissions(detailsPermissions);

    const sectionHandleChange: HandleChangeInRightSidebar<Section> = (type, item, id) => {
        if (type === TablePageActionType.DELETE) {
            setCourseSections(courseSections.filter(section => section.section._id !== id));
        } else if (type === TablePageActionType.EDIT) {
            setCourseSections(courseSections.map(section => {
                if (section.section._id === id && item) {
                    section.section = item;
                }
                return section;
            }));
        }
    };

    const lessonHandleChange: HandleChangeInRightSidebar<LessonGetResponse> = (type, item, id) => {
        setCourseSections(courseSections.map(section => {
            if (section.lessons) {
                if (type === TablePageActionType.DELETE) {
                    section.lessons = section.lessons.filter(lesson => lesson._id !== id);
                } else if (type === TablePageActionType.EDIT) {
                    section.lessons = section.lessons.map(lesson => {
                        if (lesson._id === id && item) {
                            return item;
                        }
                        return lesson;
                    });
                }
            }
            return section;
        }));
    };

    return (
        <RightSidebar
            useSidebarHook={useNonPersistentSidebar}
            content={(classNames, setIsExpanded) => (
                <div className={cn(classNames.containerClassName)}>
                    {selectedSectionIdToEdit && (
                        <SectionRightSidebarModal
                            courseId={course._id}
                            selectedId={selectedSectionIdToEdit}
                            setSelectedId={setSelectedSectionIdToEdit}
                            setIsExpanded={setIsExpanded}
                            sections={courseSections}
                            validateSectionTitle={validateSectionTitle}
                            sectionTitleError={sectionTitleError}
                            setSectionTitleError={setSectionTitleError}
                            handleChange={sectionHandleChange}
                        />
                    )}
                    {selectedLessonToEdit && (
                        <LessonRightSidebarModal
                            courseId={course._id}
                            selected={selectedLessonToEdit}
                            setSelected={setSelectedLessonToEdit}
                            setIsExpanded={setIsExpanded}
                            handleChange={lessonHandleChange}
                        />
                    )}
                </div>
            )}
        >
            {(isExpanded, onClick) => (
                <div className={cn({ [styles.expanded]: isExpanded })}>
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        {onClose =>
                            <CoursesHubEditorsModal
                                courseId={course._id}
                                editors={courseEditors || []}
                                onSave={(editors) => setCourseEditors(editors)}
                                onCancel={onClose as any}
                                permissions={{ manageModerators, manageOwners }}
                            />
                        }
                    </Modal>
                    <CoursesItemHeader
                        course={course}
                        header={
                            <Breadcrumbs
                                position={ChildrenPosition.Left}
                                currentPathName={t(`${coursesHubPrefix}.current-course`)}
                            />
                        }
                        pointer={false}
                        underTitle={
                            <div className={styles.underTitle}>
                                <Tag
                                    tag={getPublicationStatus(t, course.isPublished)}
                                    type={TagType.Warning}
                                />
                                <Tag
                                    tag={`v${course.versionName}`}
                                    type={TagType.Info}
                                />
                            </div>
                        }
                    />
                    <CoursesListItemDescription
                        description={course.description}
                        isExpanded={true}
                    />
                    <div className={styles.body}>

                        <div className={styles.firstBodyChild}>
                            <CoursesHubDetailsHeader
                                title={t(`${coursesHubEditorsPrefixTranslate}.name`)}
                                action={`${t(`${coursesHubEditorsPrefixTranslate}.manage-editors`)}`}
                                onClick={() => setIsModalOpen(true)}
                                isActionPermitted={manageModerators || manageOwners}
                            />
                            {courseEditors && !!courseEditors.length &&
                                <CoursesHubEditors editors={courseEditors} />
                            }
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
                                        setLesson={(lesson) => {
                                            setSelectedLessonToEdit(lesson);
                                            onClick();
                                        }}
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
                                                userApiClient.post<LessonToSaveOnDraftResponse>(
                                                    `${coursesHubLessonsPrefixApi}.create`,
                                                    {
                                                        type: LessonSaveType.Draft,
                                                        sectionId: section.section._id, courseId: section.section.courseId
                                                    }
                                                ).then(({ lessonId }) => {
                                                    router.push(`/${coursesHubPrefix}/${course._id}/${lessonId}?video=true`);
                                                })
                                            },
                                            type: ChildrenPosition.Bottom
                                        }]}
                                        className={styles.section}
                                    />
                                ))}
                            </div>
                        </div>

                        {(viewSubscribers || viewStatistics) &&
                            <CoursesHubSideSection
                                courseId={course._id}
                                tabs={Object.values(CoursesHubSideSectionMainTabs).filter(tab => {
                                    return (tab === CoursesHubSideSectionMainTabs.Users && viewSubscribers) ||
                                        (tab === CoursesHubSideSectionMainTabs.Statistics && viewStatistics);
                                })}
                            />
                        }

                    </div>
                </div>
            )}
        </RightSidebar>
    );
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.course) === JSON.stringify(nextProps.course);
});