export interface ApiIntegrationToSave {
    name: string;
    secret: string;
    script: string;
    u: {
        _id: string;
        username: string;
    };
}