export interface Course {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    imageUrl: string;
    u: {
        _id: string;
        name: string;
    };
    tags: string[];
    isPublished?: boolean;
}