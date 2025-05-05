"use client";

import { ButtonBack } from "@/components/Button/ButtonBack/ButtonBack";
import { StickyBottomBar } from "@/components/StickyBottomBar/StickyBottomBar";
import { LessonPage } from "@/courses/courses-list/components/LessonPage/LessonPage";
import { LessonItem } from "@/courses/courses-list/types/LessonItem";
import { StuffTypes } from "@/stuff/types/StuffTypes";
import { PageMode } from "@/types/PageMode";
import { useState } from "react";
import styles from "./CreateLessonSynopsisAndStuff.module.css";
import { coursesHubLessonsPrefixTranslate } from "@/helpers/prefixes";
import { Button, ButtonType } from "@/components/Button/Button";
import { FillBorderUnderlineMode } from "@/types/FillBorderUnderlineMode";

export const CreateLessonSynopsisAndStuff = ({ _id }: { _id: string }) => {
    const initialLesson = {
        _id,
        title: "пример урока",
        time: "30 минут",
        synopsis: `
## классификация case:

- средства анализа и проектирования (например, AllFusion Process Modeler (BPwin), Busines Modeller, IBM Rational Rose и др.);
- средства проектирования баз данных (AllFusion Data Modeler (ERwin), Power Modeller, Emb ERStudio и др.);
- средства разработки и тестирования приложений (TAU/Developer,TAU/Tester, MS VS.Net, Emb RAD-Studio и др.);
- средства реинжиниринга процессов и документирования;
            `,
        imageUrl: 'http://localhost:3000/justpic1.png',
        videoUrl: 'http://localhost:3000/justvideo.mp4',
        stuffs: [
            {
                _id: '1',
                type: StuffTypes.Link,
                value: 'http://localhost:3000/courses-list/1/1',
            },
            {
                _id: '2',
                type: StuffTypes.Task,
                file: {
                    url: 'http://localhost:3000/justdoc.docx',
                    name: 'justdoc.docx'
                }
            },
        ]
    };

    const [lesson, setLesson] = useState<LessonItem | undefined>(initialLesson);

    if (!lesson) {
        return null;
    }

    const saveItem = () => { };

    return (
        <StickyBottomBar barContent={
            <div className={styles.buttonContainer}>
                <ButtonBack hasBackButtonIcon={false} />
                {JSON.stringify(initialLesson) != JSON.stringify(lesson) &&
                    <Button
                        onClick={() => saveItem()}
                        prefix={coursesHubLessonsPrefixTranslate}
                        type={ButtonType.SAVE}
                        mode={FillBorderUnderlineMode.UNDERLINE}
                        noEffects={true}
                    />
                }
            </div>
        }>
            <LessonPage
                mode={PageMode.Editor}
                hasTitle={false}
                lesson={lesson}
                setLesson={setLesson}
            />
        </StickyBottomBar>
    );
};