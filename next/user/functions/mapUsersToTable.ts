import { TFunction } from "i18next"
import { UserItem } from "../types/UserItem"
import { UserTableItem } from "../types/UserTableItem"
import { rolesPrefix, usersPrefix } from "@/helpers/prefixes";

export const mapUsersToTable = (user: UserItem, _: string, t: TFunction): UserTableItem => {
    return {
        ...user,
        roles: user.roles.map(r => t(`${rolesPrefix}.${r}`)).join(', '),
        status: user.active ? t(`${usersPrefix}.active`) : t(`${usersPrefix}.inactive`)
    };
}