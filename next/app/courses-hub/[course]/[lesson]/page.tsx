import { CreateLessonDetails } from "@/courses/courses-hub/components/CreateLesson/CreateLessonDetails/CreateLessonDetails";
import { LessonPage } from "@/courses/courses-list/components/LessonPage/LessonPage";
import { StuffTypes } from "@/stuff/types/StuffTypes";
import { PageMode } from "@/types/PageMode";

export default async function DynamicCourseHubLessonPage({
    params, searchParams
}: {
    params: { lesson: string };
    searchParams?: { details?: boolean };
}) {
    const { lesson } = await params;
    const details = await searchParams?.details;

    if (!!details) {
        return (<CreateLessonDetails />);
    }

    return (<LessonPage
        mode={PageMode.Editor}
        lesson={{
            _id: lesson,
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
        }}
    />);
}
