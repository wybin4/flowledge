export enum RoleScope {
    Users = 'Users',
    Courses = 'Courses'
}

export interface IRole {
    description: string;
    name: string;
    scope: RoleScope;
    _id: string;
}
