import { LessonsPage } from "@/courses/courses-list/components/LessonPage/LessonsPage";
import { StuffTypes } from "@/stuff/types/StuffTypes";
import { PageMode } from "@/types/PageMode";

export default async function DynamicCourseListLessonPage({ params }: { params: { lesson: string } }) {
    return (<LessonsPage
        mode={PageMode.Viewer}
        lesson={{
            _id: '1',
            title: "Пример урока",
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
