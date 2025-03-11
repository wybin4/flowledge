import { UserEmail } from "./UserEmail";
import { UserSetting } from "./UserSetting";
import { UserType } from "./UserType";

export interface User {
    createdAt: Date;
    type: UserType;
    active: boolean;
    username: string;
    name: string;
    email?: UserEmail;
    settings: UserSetting;
}
