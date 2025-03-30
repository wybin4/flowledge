export interface Course {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    u: {
        _id: string;
        name: string;
    }
}