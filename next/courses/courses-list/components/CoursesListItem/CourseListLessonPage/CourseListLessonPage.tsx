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
import { useRouter } from "next/navigation";

interface SidebarItem extends Omit<LessonPageSectionItem, 'lessons'> {
    lessons: {
        lesson: LessonPageSectionLessonItemMapped;
        materials: LessonSidebarMaterials[];
    }[];
};

export const CourseListLessonPage = ({ lessonId }: { lessonId: string }) => {
    const [currentLesson, setCurrentLesson] = useState<LessonPageItem | undefined>(undefined);
    const [currentLessonMaterials, setCurrentLessonMaterials] = useState<LessonSidebarMaterials[] | undefined>(undefined);
    const [currentLessonMaterial, setCurrentLessonMaterial] = useState<LessonSidebarMaterials | undefined>(undefined);
    const [section, setSection] = useState<SidebarItem | undefined>(undefined);

    const { t } = useTranslation();

    const router = useRouter();

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
                        const currentLessonMaterials = lessons.find(lesson => lesson.lesson._id === currentLessonRes._id)?.materials;
                        setCurrentLessonMaterials(currentLessonMaterials);
                        setSection({ ...sectionRes, lessons });
                    }
                });
            }
        });
    }, [lessonId]);

    if (!currentLesson || !section) {
        return <>{t('loading')}</>;
    }

    const handleMaterialClick = (materialType: string) => {
        setCurrentLessonMaterials((clm) =>
            clm?.map(m => ({
                ...m,
                selected: m.type === materialType
            }))
        );
        const currentLessonMaterial = currentLessonMaterials?.find(m => m.type === materialType);
        setCurrentLessonMaterial(currentLessonMaterial);
    };

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
                                        onClick={() => {
                                            handleMaterialClick(material.type);
                                            material.onClick?.(router);
                                        }}
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
                <StickyBottomBar barContent={
                    <div className={styles.buttonContainer}>
                        <ButtonBack hasBackButtonIcon={false} backButtonStyles={styles.backButton} />
                        <Button
                            onClick={() => { }}
                            title={t(`${coursesListPrefix}.next-material`)}
                            type={ButtonType.SAVE}
                            mode={FillBorderUnderlineMode.UNDERLINE}
                            noEffects={true}
                            className={styles.button}
                        />
                    </div>
                }>
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

                </StickyBottomBar>
            </div>
        )}</RightSidebar>
    );
};