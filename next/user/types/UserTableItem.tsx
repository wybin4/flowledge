import { UserItem } from "./UserItem";

export interface UserTableItem extends Omit<UserItem, 'roles' | 'active'> {
    roles: string;
    status: string;
};