"use client";

import RightSidebar from "@/components/Sidebar/RightSidebar/RightSidebar";
import { useTranslation } from "react-i18next";
import styles from "./CreateLessonSurvey.module.css";
import { useState } from "react";

export const CreateLessonSurvey = () => {
    const [questions, setQuestions] = useState<string[]>(["какую цель преследует статья с проектами для начинающих python-разработчиков?", "что помогут сделать предложенные в статье проекты для начинающих python-разработчиков?"]);

    const { t } = useTranslation();

    return (
        <RightSidebar content={classNames =>
            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <div className={styles.titleText}>{t('questions.name')} ({5})</div>
                    <div className={styles.titleButton}>{t('questions.add')}</div>
                </div>
                {questions.map((question, index) => (
                    <div key={index} className={styles.questionContainer}>
                        <div className={styles.questionNumber}>{index + 1}</div>
                        <div className={styles.questionText}>{question}</div>
                    </div>
                ))}
            </div>
        }>{(isExpanded, toggleSidebar) => (
            <div>
                <button onClick={toggleSidebar}>toggle</button>
            </div>
        )}</RightSidebar>
    )
};