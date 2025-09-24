export enum ApiIntegrationEntity {
    Survey = 'survey'
}

export interface ApiIntegration {
    id: string;
    name: string;
    secret: string;
    script: string;
    u: {
        id: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    enabled: boolean;
    entity: ApiIntegrationEntity;
}