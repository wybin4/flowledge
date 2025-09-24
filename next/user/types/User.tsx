import { UserEmail } from "./UserEmail";
import { UserSetting } from "./UserSetting";

export interface User {
    id: string;
    createdAt: Date;
    roles: string[];
    active: boolean;
    username: string;
    name: string;
    email?: UserEmail;
    settings: UserSetting;
}
