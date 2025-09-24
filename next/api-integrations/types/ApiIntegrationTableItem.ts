import { ApiIntegrationEntity } from "./ApiIntegration";

export type ApiIntegrationTableItem = {
    id: string;
    title: string;
    status: string;
    user: string;
    createdAt: string;
    entity: string;
};
