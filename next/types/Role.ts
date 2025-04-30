export enum RoleScope {
    Users = 'USERS',
    Courses = 'COURSES'
}

export interface IRole {
    description: string;
    name: string;
    scopes: RoleScope[];
    _id: string;
}
