export type UserToSave = {
    name: string;
    avatar: string;
    username: string;
    password?: string;
    roles: string[];
    active: boolean;
};