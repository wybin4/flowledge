"use client";

import { PageMode } from "@/types/PageMode";
import { useEffect, useState } from "react";
import { LessonPage } from "../../../../components/LessonPage/LessonPage";
import { userApiClient } from "@/apiClient";
import { coursesListLessonsPrefixApi, coursesListPrefix, coursesListSectionsPrefixApi } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import { LessonPageItem } from "@/courses/courses-list/types/LessonPageItem";
import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import styles from "./CourseListLessonPage.module.css";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { ItemSize } from "@/types/ItemSize";
import cn from "classnames";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ChildrenPosition } from "@/types/ChildrenPosition";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";
import { LessonPageSectionItem, LessonPageSectionLessonItem, LessonPageSectionLessonItemMapped } from "@/courses/courses-list/types/LessonPageSectionItem";
import { CourseListLessonSidebarItem } from "./CourseListLessonSidebarItem/CourseListLessonSidebarItem";
import { CourseListLessonSidebarItemChild } from "./CourseListLessonSidebarItem/CourseListLessonSidebarItemChild";
import { getLessonSidebarMaterials, LessonSidebarMaterials } from "@/courses/functions/getLessonSidebarMaterials";
import { mapLessonToPage } from "@/courses/functions/mapLessonToPage";
import { usePathname, useRouter } from "next/navigation";
import { CourseListSurvey } from "../CoursesListItem/CourseListSurvey/CourseListSurvey";
import { CourseListLessonPageStickyBottomBar } from "./CourseListLessonPageStickyBottomBar";
import { removeLastSegment } from "@/helpers/removeLastSegment";
import { ButtonBackContainer } from "@/components/Button/ButtonBack/ButtonBackContainer";

interface SidebarItem extends Omit<LessonPageSectionItem, 'lessons'> {
    lessons: {
        lesson: LessonPageSectionLessonItemMapped;
        materials: LessonSidebarMaterials[];
    }[];
};

type CourseListLessonPageProps = {
    lessonId: string;
    isSurvey?: boolean;
};

export const CourseListLessonPage = ({ lessonId, isSurvey }: CourseListLessonPageProps) => {
    const [currentLesson, setCurrentLesson] = useState<LessonPageItem | undefined>(undefined);
    const [currentLessonMaterials, setCurrentLessonMaterials] = useState<LessonSidebarMaterials[] | undefined>(undefined);
    const [currentLessonMaterial, setCurrentLessonMaterial] = useState<LessonSidebarMaterials | undefined>(undefined);
    const [section, setSection] = useState<SidebarItem | undefined>(undefined);

    const { t } = useTranslation();

    const router = useRouter();
    const currentPath = usePathname();

    useEffect(() => {
        userApiClient.get<LessonPageItem>(
            `${coursesListLessonsPrefixApi}.get/${lessonId}`
        ).then(currentLessonRes => {
            const transformedLesson = mapLessonToPage<LessonPageItem>(currentLessonRes);
            setCurrentLesson(transformedLesson);
            if (currentLessonRes.sectionId && !section) {
                userApiClient.get<LessonPageSectionItem>(
                    `${coursesListSectionsPrefixApi}/${currentLessonRes.sectionId}.lessons`
                ).then(sectionRes => {
                    if (sectionRes) {
                        const lessons = sectionRes.lessons.map(lesson => {
                            const transformedLesson = mapLessonToPage<LessonPageSectionLessonItem>(lesson);
                            const materials = getLessonSidebarMaterials(transformedLesson);

                            return {
                                lesson: transformedLesson,
                                materials
                            };
                        });
                        setSection({ ...sectionRes, lessons });
                        const currentLessonMaterials = lessons.find(lesson => lesson.lesson._id === currentLessonRes._id)?.materials;
                        if (currentLessonMaterials && currentLessonMaterials.length) {
                            setCurrentLessonMaterial(currentLessonMaterials[0]);
                            setCurrentLessonMaterials(currentLessonMaterials);
                        }
                    }
                });
            }
        });
    }, [lessonId]);

    if (!currentLesson || !section) {
        return <>{t('loading')}</>;
    }

    const updateSelectedMaterial = (materialType: string) => {
        setCurrentLessonMaterials((clm) =>
            clm?.map(m => ({
                ...m,
                selected: m.type === materialType
            }))
        );
        const currentLessonMaterial = currentLessonMaterials?.find(m => m.type === materialType);
        setCurrentLessonMaterial(currentLessonMaterial);
    };

    const handleMaterialClick = (materialType: string) => {
        updateSelectedMaterial(materialType);
    };

    const handleMaterialAction = (material: LessonSidebarMaterials) => {
        handleMaterialClick(material.type);
        material.onClick?.(router);
    };

    const getNextLessonId = (currentLessonId: string): string | undefined => {
        if (!section) return undefined;

        const lessons = section.lessons;
        const currentIndex = lessons.findIndex(lesson => lesson.lesson._id === currentLessonId);

        if (currentIndex === -1) return undefined;

        const nextIndex = (currentIndex + 1) % lessons.length;
        return lessons[nextIndex].lesson._id;
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

    const handleNextMaterialClick = () => {
        navigateMaterial('next');
    };

    const handlePreviousMaterialClick = () => {
        navigateMaterial('previous');
    };

    const handleNextLessonClick = () => {
        const nextLessonId = getNextLessonId(lessonId);
        const basePath = removeLastSegment(currentPath);
        if (nextLessonId) {
            router.push(`${basePath}/${nextLessonId}`);
        }
    };

    const handleExitFromSurvey = () => {
        if (currentLesson._id) {
            const basePath = removeLastSegment(currentPath);
            router.push(`${basePath}/${currentLesson._id}`);
            handlePreviousMaterialClick();
        }
    };

    if (isSurvey) {
        return (
            <CourseListSurvey
                lessonId={lessonId}
                onExit={handleExitFromSurvey}
                onBack={handlePreviousMaterialClick}
                onNext={handleNextLessonClick}
            />
        );
    }

    return (
        <RightSidebar
            content={({ headerClassName }) =>
                <div className={styles.sidebarContainer}>
                    <div className={styles.sectionDescription}>{t(`${coursesListPrefix}.section`)}</div>
                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                    <div className={styles.lessonsContainer}>
                        {section.lessons.map(({ lesson, materials }, index) => (
                            <CourseListLessonSidebarItem
                                key={index}
                                title={lesson.title}
                                expandedByDefault={lesson._id === currentLesson._id}
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
                                        title={currentLesson.title}
                                        imageUrl={currentLesson.imageUrl}
                                        name={material.type}
                                        description={material.description}
                                    />
                                ))}
                            </CourseListLessonSidebarItem>
                        ))}
                    </div>
                </div>
            }
        >{(isExpanded, toggleSidebar) => (
            <div className={cn(styles.container, {
                [styles.expanded]: isExpanded
            })}>
                <CourseListLessonPageStickyBottomBar
                    titlePostfix='next-material'
                    onClick={handleNextMaterialClick}
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
                            tabs={currentLessonMaterial.tab ? [currentLessonMaterial.tab] : undefined}
                        />
                    )}
                </CourseListLessonPageStickyBottomBar>
            </div>
        )}</RightSidebar>
    );
};