"use client";

import { PageMode } from "@/types/PageMode";
import { useEffect, useState } from "react";
import { LessonPage } from "../../../../components/LessonPage/LessonPage";
import { userApiClient } from "@/apiClient";
import { courseProgressPrefix, coursesListLessonsPrefixApi, coursesListPrefix, coursesListSectionsPrefixApi, courseSubscriptionsPrefix } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { LessonPageItem } from "@/courses/courses-list/types/LessonPageItem";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import styles from "./CourseListLessonPage.module.css";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { ItemSize } from "@/types/ItemSize";
import cn from "classnames";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { LessonPageSectionItem, LessonPageSectionLessonItem } from "@/courses/courses-list/types/LessonPageSectionItem";
import { CourseListLessonSidebarItem } from "./CourseListLessonSidebarItem/CourseListLessonSidebarItem";
import { CourseListLessonSidebarItemChild } from "./CourseListLessonSidebarItem/CourseListLessonSidebarItemChild";
import { getLessonSidebarMaterials, LessonSidebarMaterials } from "@/courses/courses-list/functions/getLessonSidebarMaterials";
import { mapLessonToPage } from "@/courses/courses-list/functions/mapLessonToPage";
import { usePathname, useRouter } from "next/navigation";
import { CourseListSurvey } from "../CoursesListItem/CourseListSurvey/CourseListSurvey";
import { CourseListLessonPageStickyBottomBar } from "./CourseListLessonPageStickyBottomBar";
import { removeLastSegment } from "@/helpers/removeLastSegment";
import { CourseListLessonSidebarItem as SidebarItem } from "@/courses/courses-list/types/CourseListLessonSidebarItem";
import { ScrollTracker } from "@/components/ScrollTracker/ScrollTracker";
import { SynopsisLessonTabs } from "@/courses/types/SynopsisLessonTabs";
import { LessonSaveType } from "@/courses/types/LessonSaveType";
import { useCourseSubscription } from "@/courses/hooks/useCourseSubscription";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import { Identifiable } from "@/types/Identifiable";
import { Gender } from "@/types/Gender";

type CourseListLessonPageProps = {
    lessonId: string;
    isSurvey?: boolean;
    version?: string;
};

export const CourseListLessonPage = ({ lessonId, isSurvey, version }: CourseListLessonPageProps) => {
    const [currentLesson, setCurrentLesson] = useState<LessonPageItem | undefined>(undefined);
    const [currentLessonMaterials, setCurrentLessonMaterials] = useState<LessonSidebarMaterials[] | undefined>(undefined);
    const [currentLessonMaterial, setCurrentLessonMaterial] = useState<LessonSidebarMaterials | undefined>(undefined);
    const [section, setSection] = useState<SidebarItem | undefined>(undefined);

    const [currentProgress, setCurrentProgress] = useState<number>(0);
    const [lastSentProgress, setLastSentProgress] = useState<number>(0);

    const { t } = useTranslation();

    const router = useRouter();
    const currentPath = usePathname();

    const pathSegments = currentPath.split('/');
    const courseId = pathSegments[2];
    const subscription = useCourseSubscription(courseId);

    useEffect(() => {
        if (!version) {
            return;
        }

        userApiClient.get<LessonPageItem>(
            `${coursesListLessonsPrefixApi}.get/${lessonId}?courseId=${courseId}`
        ).then(currentLessonRes => {
            const transformedLesson = mapLessonToPage<LessonPageItem>(currentLessonRes);
            setCurrentLesson(transformedLesson);
            if (currentLessonRes.sectionId && !section) {
                userApiClient.get<LessonPageSectionItem>(
                    `${coursesListSectionsPrefixApi}/${currentLessonRes.sectionId}.lessons?version=${version}&courseId=${courseId}`
                ).then(sectionRes => {
                    if (sectionRes) {
                        const lessons = sectionRes.lessons.map(lesson => {
                            const transformedLesson = mapLessonToPage<LessonPageSectionLessonItem>(lesson);
                            const materials = getLessonSidebarMaterials(transformedLesson, styles);

                            return {
                                lesson: transformedLesson,
                                materials
                            };
                        });

                        setSection({ ...sectionRes, lessons });
                        const currentLessonMaterials = lessons.find(lesson => lesson.lesson.id === currentLessonRes.id)?.materials;
                        if (currentLessonMaterials && currentLessonMaterials.length) {
                            setCurrentLessonMaterial(currentLessonMaterials[0]);
                            setCurrentLessonMaterials(currentLessonMaterials);
                        }
                    }
                });
            }
        });
    }, [lessonId]);

    useEffect(() => {
        if (currentLesson) {
            const currentSectionProgress = subscription?.progress?.sections.find(s => s.id === currentLesson.sectionId);
            const sectionProgress = currentSectionProgress?.progress;

            setSection((prevState: SidebarItem | undefined) => {
                if (!prevState || !currentSectionProgress) {
                    return prevState;
                }

                const updatedLessons = prevState.lessons.map(lessonItem => {
                    const lessonProgress = currentSectionProgress.lessons.find(l => l.id === lessonItem.lesson.id);

                    if (lessonProgress) {
                        const updatedMaterials = lessonItem.materials.map(material => {
                            switch (material.type) {
                                case LessonSaveType.Video:
                                    return {
                                        ...material,
                                        progress: lessonProgress.videoProgress
                                    };
                                case LessonSaveType.Synopsis:
                                    return {
                                        ...material,
                                        progress: lessonProgress.synopsisProgress
                                    };
                                case LessonSaveType.Survey:
                                    return {
                                        ...material,
                                        progress: lessonProgress.isSurveyPassed ? 100 : 0
                                    };
                                default:
                                    return material;
                            }
                        });

                        return {
                            ...lessonItem,
                            materials: updatedMaterials
                        };
                    }

                    return lessonItem;
                });

                return {
                    ...prevState,
                    progress: sectionProgress,
                    lessons: updatedLessons
                };
            });
        }
    }, [JSON.stringify(subscription), JSON.stringify(currentLesson), JSON.stringify(section)]);

    if (!currentLesson || !section) {
        return <>{t('loading')}</>;
    }

    const updateSelectedMaterial = (materialType: LessonSaveType) => {
        setCurrentLessonMaterials((clm) =>
            clm?.map(m => ({
                ...m,
                selected: m.type === materialType
            }))
        );
        const currentLessonMaterial = currentLessonMaterials?.find(m => m.type === materialType);
        setCurrentLessonMaterial(currentLessonMaterial);
    };

    const handleMaterialClick = (materialType: LessonSaveType) => {
        updateSelectedMaterial(materialType);
    };

    const handleMaterialAction = (material: LessonSidebarMaterials) => {
        handleMaterialClick(material.type);
        material.onClick?.(router);
    };

    const findCurrentLessonIndex = (lessons: { lesson: Identifiable }[], currentLessonId: string): number => {
        return lessons.findIndex(lesson => lesson.lesson.id === currentLessonId);
    };

    const getNextLessonId = (currentLessonId: string): string | undefined => {
        if (!section) return undefined;

        const lessons = section.lessons;
        const currentIndex = findCurrentLessonIndex(lessons, currentLessonId);

        if (currentIndex === -1 || currentIndex === lessons.length - 1) {
            return undefined;
        }

        return lessons[currentIndex + 1].lesson.id;
    };

    const navigateMaterial = (direction: 'next' | 'previous') => {
        if (!currentLessonMaterials || !currentLessonMaterial) return;

        const currentIndex = currentLessonMaterials.findIndex(m => m.type === currentLessonMaterial.type);
        let nextIndex;

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % currentLessonMaterials.length;
        } else {
            nextIndex = (currentIndex - 1 + currentLessonMaterials.length) % currentLessonMaterials.length;
        }

        const nextMaterial = currentLessonMaterials[nextIndex];
        handleMaterialAction(nextMaterial);
    };

    const handleNextMaterialClick = async () => {
        await sendProgressOnNavigation();
        navigateMaterial('next');
    };

    const handleNextSectionClick = async () => {
        await sendProgressOnNavigation();
        const basePath = removeLastSegment(currentPath);
        if (section.nextSectionLessonId) {
            router.push(`${basePath}/${section.nextSectionLessonId}`);
        }
    };

    const handleFinishCourseClick = async () => {
        await sendProgressOnNavigation();
        const basePath = removeLastSegment(currentPath);
        router.push(basePath);
    };

    const handlePreviousMaterialClick = () => {
        navigateMaterial('previous');
    };

    const handleNextLessonClick = async () => {
        await sendProgressOnNavigation();
        const nextLessonId = getNextLessonId(lessonId);
        const basePath = removeLastSegment(currentPath);
        if (nextLessonId) {
            router.push(`${basePath}/${nextLessonId}`);
        }
    };

    const handleExitFromSurvey = () => {
        if (currentLesson.id) {
            const basePath = removeLastSegment(currentPath);
            router.push(`${basePath}/${currentLesson.id}`);
            handlePreviousMaterialClick();
        }
    };

    const getNext = () => {
        const currentLessonId = currentLesson.id;
        const nextLessonId = getNextLessonId(currentLessonId);

        const currentMaterialIndex = currentLessonMaterials?.findIndex(m => m.type === currentLessonMaterial?.type) ?? -1;
        const nextMaterialExists = currentMaterialIndex !== -1 && currentMaterialIndex < ((currentLessonMaterials?.length || 0) - 1);

        const isLessonFinished = !nextMaterialExists;
        const isSectionFinished = nextLessonId === undefined && isLessonFinished;
        const isCourseFinished = !section.nextSectionLessonId;

        if (isSectionFinished) {
            return {
                titlePostfix: isCourseFinished ? 'finish' : 'next-section',
                onClick: isCourseFinished ? handleFinishCourseClick : handleNextSectionClick
            };
        } else {
            return {
                titlePostfix: isLessonFinished ? 'next-lesson' : 'next-material',
                onClick: isLessonFinished ? handleNextLessonClick : handleNextMaterialClick
            };
        }
    };
    const { titlePostfix: nextTitlePostfix, onClick: onNext } = getNext();

    const sendProgress = async (lessonId: string, progress: number) => {
        if (currentLessonMaterial && subscription) {
            try {
                await userApiClient.post(`${courseSubscriptionsPrefix}/${courseProgressPrefix}.send`,
                    { progress, lessonId, type: currentLessonMaterial.type, subscriptionId: subscription.subId }
                );
                console.log("Progress sent:", progress);
            } catch (error) {
                console.error("Failed to send progress:", error);
            }
        }
    };

    const sendProgressOnNavigation = async () => {
        if (currentProgress !== lastSentProgress) {
            await sendProgress(lessonId, currentProgress);
            setLastSentProgress(currentProgress);
            setCurrentProgress(0);
        }
    };

    if (isSurvey) {
        return (
            <CourseListSurvey
                courseId={courseId}
                titlePostfix={nextTitlePostfix}
                lessonId={lessonId}
                onExit={handleExitFromSurvey}
                onBack={handlePreviousMaterialClick}
                onNext={onNext}
            />
        );
    }

    return (
        <RightSidebar
            content={({ headerClassName }) =>
                <div className={styles.sidebarContainer}>
                    <div className={styles.sectionTitleContainer}>
                        <div className={styles.sectionDescription}>{t(`${coursesListPrefix}.section`)}</div>
                        <h2 className={styles.sectionTitle}>{section.title}</h2>
                        {section.progress && (
                            <ProgressBar
                                progress={section.progress}
                                gender={Gender.Male}
                                prefix={coursesListPrefix}
                                size={ItemSize.Big}
                                className={styles.sectionBar}
                                additionalText={`${findCurrentLessonIndex(section.lessons, currentLesson.id) + 1}/${section.lessons.length}`}
                            />
                        )}
                    </div>
                    <div className={styles.lessonsContainer}>
                        {section.lessons.map(({ lesson, materials }, index) => (
                            <CourseListLessonSidebarItem
                                key={index}
                                title={lesson.title}
                                expandedByDefault={lesson.id === currentLesson.id}
                                headerClassName={headerClassName}
                            >
                                {materials.length === 0 && (
                                    <div className={cn(styles.sectionDescription, styles.negMt)}>
                                        {t('nothing-found')}
                                    </div>
                                )}
                                {materials.map((material, index) => (
                                    <CourseListLessonSidebarItemChild
                                        key={index}
                                        onClick={() => handleMaterialAction(material)}
                                        title={lesson.title}
                                        imageUrl={lesson.imageUrl}
                                        name={material.type.toLowerCase()}
                                        description={material.description}
                                        progress={material.progress}
                                        gender={material.gender}
                                    />
                                ))}
                            </CourseListLessonSidebarItem>
                        ))}
                    </div>
                </div>
            }
        >{(isExpanded, toggleSidebar) => (
            <ScrollTracker
                setScrollPercent={setCurrentProgress}
                className={cn(styles.container, {
                    [styles.expanded]: isExpanded,
                    [styles.scrollable]: currentLessonMaterial?.tab == SynopsisLessonTabs.Synopsis,
                    [styles.scrollableExpanded]: currentLessonMaterial?.tab == SynopsisLessonTabs.Synopsis && isExpanded
                })}
            >
                <CourseListLessonPageStickyBottomBar
                    titlePostfix={nextTitlePostfix}
                    onClick={onNext}
                    className={cn(styles.stickyBar, {
                        [styles.stickyBarExpanded]: !isExpanded
                    })}
                >
                    <div className={cn(styles.titleContainer, styles.mb)}>
                        <Breadcrumbs
                            pathNames={[section.courseName ?? '', currentLesson.title ?? '']}
                            position={ChildrenPosition.Left}
                            className={styles.crumbsContainer}
                        />
                        <MenuButton
                            size={ItemSize.Medium}
                            isExpanded={isExpanded}
                            onClick={toggleSidebar}
                        />
                    </div>
                    {currentLessonMaterial && (
                        <LessonPage
                            mode={PageMode.Viewer}
                            lesson={currentLesson}
                            flags={currentLessonMaterial.flags}
                            classNames={currentLessonMaterial.classNames}
                            tabs={currentLessonMaterial.tab ? [currentLessonMaterial.tab] : undefined}
                            onProgress={setCurrentProgress}
                        />
                    )}
                </CourseListLessonPageStickyBottomBar>
            </ScrollTracker>
        )}</RightSidebar>
    );
};