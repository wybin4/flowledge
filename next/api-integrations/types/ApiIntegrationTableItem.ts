import { ApiIntegrationEntity } from "./ApiIntegration";

export type ApiIntegrationTableItem = {
    _id: string;
    title: string;
    status: string;
    user: string;
    createdAt: string;
    entity: string;
};
