export interface ApiIntegrationToSave {
    name: string;
    secret: string;
    script: string;
    u: {
        id: string;
        username: string;
    };
}