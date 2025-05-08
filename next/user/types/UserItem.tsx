export interface UserItem {
    _id: string;
    name: string;
    username: string;
    avatar: string;
    active: boolean;
    roles: string[];
    password?: string;
};