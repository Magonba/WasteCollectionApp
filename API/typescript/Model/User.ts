import {Project} from './Project';

export class User {
    email: string;
    admin: boolean;
    passwordUnsafeVar: string; //should be modified!!!
    projects: Project[];

    constructor(email: string, admin: boolean, passwordUnsafeVar: string, projects: Project[]){
        this.email = email;
        this.admin = admin;
        this.passwordUnsafeVar = passwordUnsafeVar;
        this.projects = projects;
    }
}
