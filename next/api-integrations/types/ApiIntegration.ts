export interface ApiIntegration {
    _id: string;
    name: string;
    secret: string;
    script: string;
    u: {
        _id: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    enabled: boolean;
}