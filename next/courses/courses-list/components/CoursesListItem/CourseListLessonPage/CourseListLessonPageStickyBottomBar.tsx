"use client";

import { ReactNode } from "react";
import { coursesListPrefix } from "@/helpers/prefixes";
import { useTranslation } from "react-i18next";
import styles from "./CourseListLessonPage.module.css";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { Button, ButtonType } from "@/components/Button/Button";
import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";

type CourseListLessonPageStickyBottomBarProps = {
    onClick: () => void;
    children: ReactNode;
    titlePostfix: string;
    hasBackButton?: boolean;
    className?: string;
};

export const CourseListLessonPageStickyBottomBar = ({
    children, onClick, titlePostfix, hasBackButton = true, className
}: CourseListLessonPageStickyBottomBarProps) => {
    const { t } = useTranslation();

    return (
        <StickyBottomBar
            barContent={
                <div className={styles.buttonContainer}>
                    {hasBackButton && <ButtonBack hasBackButtonIcon={false} backButtonStyles={styles.backButton} />}
                    <Button
                        onClick={onClick}
                        title={t(`${coursesListPrefix}.${titlePostfix}`)}
                        type={ButtonType.SAVE}
                        mode={FillBorderUnderlineMode.UNDERLINE}
                        noEffects={true}
                        className={styles.button}
                    />
                </div>
            }
            className={className}
        >
            {children}
        </StickyBottomBar>
    );
};