import { CoursesListItem } from "@/courses/courses-list/components/CoursesListPageItem/CoursesListItem";

export default function CoursesListPage() {
    return (
        <>
            <CoursesListItem course={{
                _id: '1',
                title: 'Course 1',
                imageUrl: 'http://localhost:3000/justpic.png'
            }} />
            <CoursesListItem course={{
                _id: '2',
                title: 'Course 2',
                imageUrl: 'http://localhost:3000/justpic.png'
            }} />
        </>
    );
}
